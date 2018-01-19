// =======================================================================================================
// ==GLOBALS
// =======================================================================================================
var y_range;
var x_range;
var c1 = [0, 0];
var c2 = [0, 0];
var iterations = 500;
var refresh = false;
var graphics;
var menu_bar;
var screen_bounds;
var graphic_bounds;
var background_image;
var windows;
var ready;
var refresh;
var save_file_name;
var reframe;
var prev_graphic;
var current_graphic;
var resolution_change;
var zoom_stack;
var ad;
var center;
var undoing;

// =======================================================================================================
// ==PRELOAD AND SETUP
// =======================================================================================================
function preload(){
	background_image = loadImage("background.png");
	intro_image = loadImage("intro.jpg");

	ad = loadImage("ad.png");

	fb_share_button = document.getElementById("fb_share_button");
	fb_share_button.style.display = "none";
}

function setup() {
	createCanvas(windowWidth, windowHeight);
	colorMode(RGB);

	initializeMenuBar();

	screen_bounds = [0, windowWidth, menu_bar.height, windowHeight];

	center = [windowWidth / 2, menu_bar.height + (windowHeight - menu_bar.height) / 2];

	current_graphic = 0;
	prev_graphic = 0;

	graphics = [];

	graphics[0] = createGraphics(600, 400);
	graphics[0].pixelDensity(1);

	graphics[1] = createGraphics(1050, 700);
	graphics[1].pixelDensity(1);

	graphics[2] = createGraphics(1650, 1100);
	graphics[2].pixelDensity(1);

	resolution_change = false;

	// var h = 1 * windowHeight;
	var h = 0.8 * windowHeight;
	var w = (3.0 / 2) * h;
	graphic_bounds = [windowWidth / 2 - w / 2, 
					  windowWidth / 2 + w / 2,
					  windowHeight / 2 + menu_bar.height / 2 - h / 2, 
				      windowHeight / 2 + menu_bar.height / 2 + h / 2];

	y_range = [-1, 1];
	x_range = [-2, 1];

	zoom_stack = [];

	save_file_name = '';

	ready = false;

	initializeWindows();

	refresh = true;
	setTimeout(refreshDrawing, 100);
	reframe = false;

	tutorial = new Tutorial();
	tutorial.initialize();
	// tutorial.open();

	undoing = false;

	fb_share_button.style.width = 30;
	fb_share_button.style.height = 10;
	fb_share_button.style.position = "absolute";
    fb_share_button.style.right = "80px";
    fb_share_button.style.top = "1px";
    fb_share_button.style.display = "block";

	screen_bounds = [0, windowWidth, menu_bar.height, windowHeight];
}

function initializeWindows(){
	windows = [];

	var color_dialog = new ColorDialogBox("Customize Color Scheme", center[0], center[1], 200, 100);
	color_dialog.initialize();
	windows = append(windows, color_dialog);

	var screenshot_dialog = new SaveDialogBox("Capture Screenshot...", center[0], center[1], 250, 80, ".jpg", saveScreenshot, updateSaveFileName);
	screenshot_dialog.initialize();
	windows = append(windows, screenshot_dialog);

	var intro = new Intro();
	intro.initialize();
	intro.open();
	windows = append(windows, intro);
}

// =======================================================================================================
// ==DRAW
// =======================================================================================================
function draw() {
	styleCursor();

	background(0);
	imageMode(CENTER);
	var ratio = background_image.width / background_image.height;
	image(background_image, windowWidth / 2, windowHeight / 2 + menu_bar.height / 2, (windowHeight - menu_bar.height) * ratio, windowHeight - menu_bar.height);
	

	// if (!(tutorial.current_window == 0 && tutorial.visible)){
		theaterMode();
		drawFrame();
		image(resolution_change ? graphics[prev_graphic] : graphics[current_graphic], windowWidth / 2, windowHeight / 2 + menu_bar.height / 2, 
			  graphic_bounds[1] - graphic_bounds[0], 
			  graphic_bounds[3] - graphic_bounds[2]);
	// }

	if (mouseIsPressed && okayToZoom()){
		c2 = [mouseX, mouseY];
		push();
		noFill();
		stroke(255, 0, 0);
		strokeWeight(2);
		rectMode(CORNERS);
		rect(c1[0], c1[1], c2[0], c2[1]);
		pop();
	}

	showWindows();

	tutorial.show();

	if (!mouseIsPressed && !keyIsPressed)
		ready = true;

	menu_bar.show();

	// fill(255);
	// text(refresh, 50, 50);
}

function drawFrame(){
	push();
	fill(220);
	stroke(0);
	rectMode(CENTER);
	rect(windowWidth / 2, windowHeight / 2 + menu_bar.height / 2, 
		  graphic_bounds[1] - graphic_bounds[0] + 30, 
		  graphic_bounds[3] - graphic_bounds[2] + 30, 10);
	fill(0);
	noStroke();
	rect(windowWidth / 2, windowHeight / 2 + menu_bar.height / 2, 
		  graphic_bounds[1] - graphic_bounds[0] + 2, 
		  graphic_bounds[3] - graphic_bounds[2] + 2);
	pop();
}

function styleCursor(){
	if (refresh)
		canvas.style.cursor = "wait";
	else if (withinBounds(mouseX, mouseY, windows[2].ad_bounds))
		canvas.style.cursor = "pointer";
	else
		canvas.style.cursor = "auto";
}
// =======================================================================================================
// ==WINDOW RESIZING
// =======================================================================================================
function windowResized(){
	resizeCanvas(windowWidth, windowHeight);
	center = [windowWidth / 2, menu_bar.height + (windowHeight - menu_bar.height) / 2];
	screen_bounds = [0, windowWidth, menu_bar.height, windowHeight];
	menu_bar.resize(windowWidth);

	var h = 0.8 * windowHeight;
	var w = (3.0 / 2) * h;
	graphic_bounds = [windowWidth / 2 - w / 2, 
					  windowWidth / 2 + w / 2,
					  windowHeight / 2 + menu_bar.height / 2 - h / 2, 
				      windowHeight / 2 + menu_bar.height / 2 + h / 2];

	windows[2].resize();
	windows[2].setPosition(center[0], center[1]);
}

// =======================================================================================================
// ==MOUSE AND KEY EVENTS
// =======================================================================================================
function mousePressed() {
	windowClickEvents();
	c1 = [mouseX, mouseY];
	menu_bar.onClick();
	tutorial.onClick();
}

function mouseReleased() {	
	if (dist(c1[0], c1[1], c2[0], c2[1]) > 10 && okayToZoom()){
		var c1_x = map(c1[0], graphic_bounds[0], graphic_bounds[1], x_range[0], x_range[1]);
		var c1_y = map(c1[1], graphic_bounds[2], graphic_bounds[3], y_range[0], y_range[1]);
		var c2_x = map(c2[0], graphic_bounds[0], graphic_bounds[1], x_range[0], x_range[1]);
		var c2_y = map(c2[1], graphic_bounds[2], graphic_bounds[3], y_range[0], y_range[1]);
		var center_x = (c1_x + c2_x) / 2;
		var h = abs(c2_y - c1_y);
		var w = (3.0 / 2) * h;
		zoom([center_x - w / 2, center_x + w / 2], [min(c1_y, c2_y), max(c1_y, c2_y)]);
		refresh = true;
		setTimeout(refreshDrawing, 50);
	}
	ready = false;
}

function keyPressed(){
	menu_bar.onKeyPress();
	if (noOpenWindows())
		menu_bar.checkShortcuts();
	windowKeyEvents();
}

function onScreen(){
	return withinBounds(mouseX, mouseY, graphic_bounds);
}

function okayToZoom(){
	return ((menu_bar.folderIsOpen() < 0 || tutorial.idle()) && onScreen()  && noOpenWindows() && ready && !refresh);
}

// =======================================================================================================
// ==FRACTALIZATION
// =======================================================================================================
function refreshDrawing(){
	var g = graphics[current_graphic];
	g.loadPixels();
	for (var i = 0; i < g.width; i++){
		for (var j = 0; j < g.height; j++){
			var a = map(i, 0, g.width - 1, x_range[0],  x_range[1]);
			var b = map(j, 0, g.height - 1, y_range[0],  y_range[1]);
			var f = colorMap(mandelbrot([0, 0], [a, b], 0, iterations));
			var pix_idx = (i + j * g.width) * 4;
			g.pixels[pix_idx + 0] = f.levels[0];
			g.pixels[pix_idx + 1] = f.levels[1];
			g.pixels[pix_idx + 2] = f.levels[2];
			g.pixels[pix_idx + 3] = 255;
		}
	}
	g.updatePixels();
	canvas.style.cursor = "auto";
	refresh = false;
	resolution_change = false;
	if (tutorial.current_window == 0 && tutorial.visible)
		nextWindow();

	else if (tutorial.current_window == 1 && tutorial.visible && undoing){
		undoing = false;
		menu_bar.enable();
		menu_bar.folders[2].buttons[0].unhighlight();
		menu_bar.closeFolder(2);
		nextWindow();
	}

	else if (tutorial.current_window == 2 && tutorial.visible && current_graphic == 2){
		menu_bar.enable();
		menu_bar.folders[3].buttons[2].unhighlight();
		menu_bar.closeFolder(3);
		nextWindow();
	}
}

function mandelbrot(z, c, ctr, i) {
	if (ctr == i) return 0;
	if (z[0]*z[0] + z[1]*z[1] > 4) 
		return Math.pow(map(ctr, 0, i, 0, 1), 1/2);
	return mandelbrot(c_add(c_square(z), c), c, ctr + 1, i);
}

function zoom(new_x_range, new_y_range){
	zoom_stack.push([x_range, y_range]);
	x_range = new_x_range;
	y_range = new_y_range;
}

function colorMap(x){
	if (x == 0)
		return color(0);
	colorMode(HSB);
	var my_color =  lerpColor(color(windows[0].color_pickers[0].value()), color(windows[0].color_pickers[1].value()), x);
	colorMode(RGB);
	return my_color;
}

// =======================================================================================================
// ==AUXILLARY MATH FUNCTIONS
// =======================================================================================================
function c_add(a, b){
	//Component-wise addition of complex numbers a and b
	return [a[0] + b[0], a[1] + b[1]];
}

function c_square(z){
	// z^2 = (a + ib)^2 = (a^2 - b^2) + (2ab)*i 
	return [z[0]*z[0] - z[1]*z[1], 2*z[0]*z[1]];
}

// =======================================================================================================
// ==MENUBAR
// =======================================================================================================
function initializeMenuBar(){
	menu_bar = new MenuBar();

	menu_bar.addFolder("Fractality");
	menu_bar.addButton("About Fractality", "", null);
	menu_bar.addButton("Return to the Studio", "Q", function() {window.location.href = 'http://fractality.me'});

	menu_bar.addFolder("File");
	menu_bar.addButton("Restart", "R", restart);
	menu_bar.addButton("Capture Screenshot", "D", function(){closeWindows(); windows[1].open()});

	menu_bar.addFolder("Edit");
	menu_bar.addButton("Undo", "Z", undo);

	menu_bar.addFolder("View");
	menu_bar.addButton("Resolution: Fastest", "1", fastRes);
	menu_bar.checkButton("Resolution: Fastest");
	menu_bar.addButton("Resolution: Balance", "2", balanceRes);
	menu_bar.addButton("Resolution: Clearest", "3", clearRes);
	menu_bar.addButton("Customize Color Scheme", "C", function(){closeWindows(); windows[0].open()});

	menu_bar.addFolder("Help");
	menu_bar.addButton("Tutorial", "T", null);
	menu_bar.addButton("Learn More", "", null);

	menu_bar.initialize();

	refreshMenubarButtons();
}

function refreshMenubarButtons(){
	menu_bar.enableButtons(["Return to the Studio", "Restart", "Capture Screenshot", "Undo", "Resolution: Fastest",
							"Resolution: Balance", "Resolution: Clearest", "Customize Color Scheme"]);
}

function undo(){
	if (zoom_stack.length >= 1){
		var result = zoom_stack.pop();
		x_range = result[0];
		y_range = result[1];
		refresh = true;
		setTimeout(refreshDrawing, 50);
		ready = false;
		undoing = true;
	}
}

function restart(){
	y_range = [-1, 1];
	x_range = [-2, 1];
	refresh = true;
	setTimeout(refreshDrawing, 50);
}

// =======================================================================================================
// ==RESOLUTION
// =======================================================================================================
function fastRes(){
	if (current_graphic != 0){
		menu_bar.checkButton("Resolution: Fastest");
		menu_bar.uncheckButton("Resolution: Balance");
		menu_bar.uncheckButton("Resolution: Clearest");
		prev_graphic = current_graphic;
		current_graphic = 0;
		resolution_change = true;
		refresh = true;
		setTimeout(refreshDrawing, 50);
		ready = false;
	}
}

function balanceRes(){
	if (current_graphic != 1){
		menu_bar.uncheckButton("Resolution: Fastest");
		menu_bar.checkButton("Resolution: Balance");
		menu_bar.uncheckButton("Resolution: Clearest");
		prev_graphic = current_graphic;
		current_graphic = 1;
		resolution_change = true;
		refresh = true;
		setTimeout(refreshDrawing, 100);
		ready = false;
	}
}

function clearRes(){
	if (current_graphic != 2){
		menu_bar.uncheckButton("Resolution: Fastest");
		menu_bar.uncheckButton("Resolution: Balance");
		menu_bar.checkButton("Resolution: Clearest");
		prev_graphic = current_graphic;
		current_graphic = 2;
		resolution_change = true;
		refresh = true;
		setTimeout(refreshDrawing, 50);
		ready = false;
	}
}

// =======================================================================================================
// ==SAVING
// =======================================================================================================
function saveScreenshot(){
	saveCanvas(graphics[current_graphic], save_file_name, 'jpg');
}

function updateSaveFileName(){
	save_file_name = this.value();
}

function nextWindow(){
	tutorial.nextWindow();
}

function startTutorial(){
	closeWindows();
	tutorial.open();
}

function doneTutorial(){
	tutorial.close();
	refreshMenubarButtons();
}

// =======================================================================================================
// ==WINDOWS
// =======================================================================================================
function showWindows(){
	if (!noOpenWindows())
		theaterMode();
	for (var i = 0; i < windows.length; i++)
		windows[i].show();
}

function closeWindows(){
	for (var i = 0; i < windows.length; i++)
		windows[i].close();
	ready = false;
}

function noOpenWindows(){
	for (var i = 0; i < windows.length; i++){
		if (windows[i].visible)
			return false;
	}
	return true;
}


function windowClickEvents(){
	for (var i = 0; i < windows.length; i++){
		if (windows[i].onClick())
			ready = false;
	}
}

function windowKeyEvents(){
	for (var i = 0; i < windows.length; i++)
		windows[i].onKeyPress();
}

function theaterMode(){
	push();
		resetMatrix();
		fill(0, 150);
		noStroke();
		rect(screen_bounds[0], screen_bounds[2], screen_bounds[1] - screen_bounds[0], screen_bounds[3] - screen_bounds[2]);
	pop();
}
