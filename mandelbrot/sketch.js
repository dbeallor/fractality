var y_range;
var x_range;
var c1 = [0, 0];
var c2 = [0, 0];
var iterations = 250;
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

function preload(){
	background_image = loadImage("background.png");
}

function setup() {
	createCanvas(windowWidth, windowHeight);
	colorMode(RGB);

	initializeMenuBar();

	// graphics = createGraphics(2400, 1600);
	graphics = createGraphics(1050, 700);
	graphics.pixelDensity(1);

	// var h = 1 * windowHeight;
	var h = 0.8 * windowHeight;
	var w = (3.0 / 2) * h;
	graphic_bounds = [windowWidth / 2 - w / 2, 
					  windowWidth / 2 + w / 2,
					  windowHeight / 2 + menu_bar.height / 2 - h / 2, 
				      windowHeight / 2 + menu_bar.height / 2 + h / 2];

	y_range = [-1, 1];
	x_range = [-2, 1];

	save_file_name = '';

	ready = true;

	initializeWindows();

	refresh = false;
	refreshDrawing();

	screen_bounds = [0, windowWidth, menu_bar.height, windowHeight];
}

function initializeWindows(){
	windows = [];

	var color_dialog = new ColorDialogBox("Customize Color Scheme", windowWidth / 2, windowHeight / 2 + menu_bar.height, 200, 100);
	color_dialog.initialize();
	windows = append(windows, color_dialog);

	var screenshot_dialog = new SaveDialogBox("Capture Screenshot...", windowWidth / 2, windowHeight / 2 + menu_bar.height, 250, 80, ".png", saveScreenshot, updateSaveFileName);
	screenshot_dialog.initialize();
	windows = append(windows, screenshot_dialog);
}

function draw() {
	if (refresh){
		canvas.style.cursor = "wait";
		if (ready){
			refresh = false;
			refreshDrawing();
		}
	}

	imageMode(CENTER);
	var ratio = background_image.width / background_image.height;
	image(background_image, windowWidth / 2, windowHeight / 2 + menu_bar.height / 2, (windowHeight - menu_bar.height) * ratio, windowHeight - menu_bar.height);
	theaterMode();

	drawFrame();

	image(graphics, windowWidth / 2, windowHeight / 2 + menu_bar.height / 2, 
		  graphic_bounds[1] - graphic_bounds[0], 
		  graphic_bounds[3] - graphic_bounds[2]);

	if (mouseIsPressed && onScreen() && noOpenWindows() && ready){
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

	if (!mouseIsPressed && !keyIsPressed)
		ready = true;

	menu_bar.show();
}

function windowResized(){
	resizeCanvas(windowWidth, windowHeight);
	screen_bounds = [0, windowWidth, menu_bar.height, windowHeight];
	menu_bar.resize(windowWidth);

	var h = 0.8 * windowHeight;
	var w = (3.0 / 2) * h;
	graphic_bounds = [windowWidth / 2 - w / 2, 
					  windowWidth / 2 + w / 2,
					  windowHeight / 2 + menu_bar.height / 2 - h / 2, 
				      windowHeight / 2 + menu_bar.height / 2 + h / 2];
}

function refreshDrawing(){
	graphics.loadPixels();
	for (var i = 0; i < graphics.width; i++){
		for (var j = 0; j < graphics.height; j++){
			var a = map(i, 0, graphics.width - 1, x_range[0],  x_range[1]);
			var b = map(j, 0, graphics.height - 1, y_range[0],  y_range[1]);
			var f = colorMap(mandelbrot([0, 0], [a, b], 0, iterations));
			var pix_idx = (i + j * graphics.width) * 4;
			graphics.pixels[pix_idx + 0] = f.levels[0];
			graphics.pixels[pix_idx + 1] = f.levels[1];
			graphics.pixels[pix_idx + 2] = f.levels[2];
			graphics.pixels[pix_idx + 3] = 255;
		}
	}
	graphics.updatePixels();
	canvas.style.cursor = "auto";
}

function mandelbrot(z, c, ctr, i) {
	if (ctr == i) return 0;
	if (z[0]*z[0] + z[1]*z[1] > 4) 
		return Math.pow(map(ctr, 0, i, 0, 1), 1/2);
	return mandelbrot(c_add(c_square(z), c), c, ctr + 1, i);
}

function mousePressed() {
	windowClickEvents();
	if (onScreen() && noOpenWindows() && ready)
		c1 = [mouseX, mouseY];
	menu_bar.onClick();
}

function mouseReleased() {	
	if (dist(c1[0], c1[1], c2[0], c2[1]) > 10 && menu_bar.folderIsOpen() < 0 && onScreen()  && noOpenWindows() && ready){
		var c1_x = map(c1[0], graphic_bounds[0], graphic_bounds[1], x_range[0], x_range[1]);
		var c1_y = map(c1[1], graphic_bounds[2], graphic_bounds[3], y_range[0], y_range[1]);
		var c2_x = map(c2[0], graphic_bounds[0], graphic_bounds[1], x_range[0], x_range[1]);
		var c2_y = map(c2[1], graphic_bounds[2], graphic_bounds[3], y_range[0], y_range[1]);
		var center_x = (c1_x + c2_x) / 2;
		var h = abs(c2_y - c1_y);
		var w = (3.0 / 2) * h;
		zoom([center_x - w / 2, center_x + w / 2], [min(c1_y, c2_y), max(c1_y, c2_y)]);
		refresh = true;
	}
	ready = false;
}

function c_add(a, b){
	//Component-wise addition of complex numbers a and b
	return [a[0] + b[0], a[1] + b[1]];
}

function c_square(z){
	// z^2 = (a + ib)^2 = (a^2 - b^2) + (2ab)*i 
	return [z[0]*z[0] - z[1]*z[1], 2*z[0]*z[1]];
}

function zoom(new_x_range, new_y_range){
	x_range = new_x_range;
	y_range = new_y_range;
}

function keyPressed(){
	menu_bar.onKeyPress();
	if (noOpenWindows())
		menu_bar.checkShortcuts();
	windowKeyEvents();
}

function restart(){
	y_range = [-1, 1];
	var r = ((windowWidth / 2) * ((abs(y_range[1] - y_range[0]) / 2) * 1.5)) / (windowHeight * (650 / 780));
	x_range = [-r - 0.5, r - 0.5];
	refreshDrawing();
}

function colorMap(x){
	if (x == 0)
		return color(0);
	colorMode(HSB);
	var my_color =  lerpColor(color(windows[0].color_pickers[0].value()), color(windows[0].color_pickers[1].value()), x);
	colorMode(RGB);
	return my_color;
}

function initializeMenuBar(){
	menu_bar = new MenuBar();

	menu_bar.addFolder("Fractality");
	menu_bar.addButton("About Fractality", "", null);
	menu_bar.addButton("Return to the Studio", "Q", function() {window.location.href = 'http://fractality.me'});

	menu_bar.addFolder("File");
	menu_bar.addButton("Restart", "R", restart);
	menu_bar.addButton("Capture Screenshot", "D", function(){closeWindows(); windows[1].open()});

	menu_bar.addFolder("View");
	menu_bar.addButton("Customize Color Scheme", "C", function(){closeWindows(); windows[0].open()});

	menu_bar.addFolder("Help");
	menu_bar.addButton("Tutorial", "T", null);
	menu_bar.addButton("Learn More", "", null);

	menu_bar.initialize();

	menu_bar.enableButtons(["Return to the Studio", "Restart", "Capture Screenshot", "Customize Color Scheme"]);
}

function onScreen(){
	return withinBounds(mouseX, mouseY, graphic_bounds);
}

function drawFrame(){
	push();
	fill(220);
	strokeWeight(2);
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

function showWindows(){
	if (!noOpenWindows())
		theaterMode();
	for (var i = 0; i < windows.length; i++)
		windows[i].show();
}

function closeWindows(){
	for (var i = 0; i < windows.length; i++)
		windows[i].close();
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

function saveScreenshot(){
	saveCanvas(graphics, save_file_name, 'jpg');
}

function updateSaveFileName(){
	save_file_name = this.value();
}

function theaterMode(){
	push();
		resetMatrix();
		fill(0, 150);
		noStroke();
		rect(screen_bounds[0], screen_bounds[2], screen_bounds[1] - screen_bounds[0], screen_bounds[3] - screen_bounds[2]);
	pop();
}
