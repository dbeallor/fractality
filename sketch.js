// =======================================================================================================
// ==GLOBALS
// =======================================================================================================
// Canvas and screen (canvas excluding menubar)
var canv;
var canvas_dims = [720, 520];
var screen_bounds;
var grid;
var images_loaded = 0;

var intro_image;
var loading_image;
var load_icon;

// Zoom and drag
var drag_mode;
var zoom_mode;

// Windows
var windows;
var gallery_images = [];
var images_loaded = 0;
var samples = ["sierpinski", "rhombi5", "snowflake", "brushstrokes", "fingerprint", "parallelogram", "spiral2",  "pinwheel",  "rhombi8", 
				"honeycomb2", "spiral8", "shield", "spiral17", "honeycomb3", "pinwheel3", "jellyfish", "snake",  "spiral16", "rhombi2",  "spiral7", "waves", 
				"parallelogram2", "spiral6"];

var fractal;
var ready;
var loading_animation;
var start_time = -1;
var fb_share_button;
var save_file_name;
var mandelbrot;
var ad;

// =======================================================================================================
// ==PRELOAD AND SETUP
// =======================================================================================================
function preload(){
	if (!detectMobile()){
		intro_image = loadImage("intro.png");
		loading_image = loadImage("intro.png");
		load_icon = loadImage("load_icon.png");
		ad = loadImage("ad.jpg");
	}

	fb_share_button = document.getElementById("fb_share_button");
	fb_share_button.style.display = "none";
}

function setup() {
	canv = createCanvas(windowWidth, windowHeight);
	if (!detectMobile()){
		angleMode(RADIANS);
		// pixelDensity(1);

		initializeMenuBar();

		screen_bounds = [0, width, menu_bar.height, height];

		grid = new Grid(width / 2, height / 2 + menu_bar.height / 2, windowWidth);

		zoom_mode = 0;
		drag_mode = 0;

		load_bar = new LoadBar(screen_bounds[1] - 100, screen_bounds[3] - 15, 80, 10);

		save_file_name = '';

		initializeWindows();

		ready = false;

		fractal = new Fractal();

		tutorial = new Tutorial();
		tutorial.initialize();
		tutorial.close();

		if (images_loaded == 0)
			for (var i = 0; i < samples.length; i++)
				gallery_images[i] = loadImage("snapshots/" + samples[i] + ".png", function() {images_loaded += 1});

		loading_animation = new LoadingAnimation();

		mandelbrot = false;

		fb_share_button.style.width = 30;
		fb_share_button.style.height = 10;
		fb_share_button.style.position = "absolute";
	    fb_share_button.style.right = "80px";
	    fb_share_button.style.top = "1px";
	    // fb_share_button.style.display = "none";
	}	
}

function initializeWindows(){
	windows = [];

	var save_dialog = new SaveDialogBox("Download as .txt file...", grid.pos.x, grid.pos.y, 250, 80, ".txt", saveSeed, updateSaveFileName);
	save_dialog.initialize();
	windows = append(windows, save_dialog);

	var screenshot_dialog = new SaveDialogBox("Capture Screenshot...", grid.pos.x, grid.pos.y, 250, 80, ".png", saveScreenshot, updateSaveFileName);
	screenshot_dialog.initialize();
	windows = append(windows, screenshot_dialog);

	var load_dialog = new LoadDialogBox("Open File...", grid.pos.x, grid.pos.y, 250, 120, handleFile, highlightDropArea, unhighlightDropArea);
	load_dialog.initialize();
	windows = append(windows, load_dialog);

	var color_dialog = new ColorDialogBox("Customize Color Scheme", grid.pos.x, grid.pos.y, 250, 110);
	color_dialog.initialize();
	windows = append(windows, color_dialog);

	var message = "Are you sure you want to leave?\nAll unsaved data will be lost.";
	var new_fractal_warning_box = new WarningBox(grid.pos.x, grid.pos.y, 220, 120, message, leave, closeWindows);
	windows = append(windows, new_fractal_warning_box);

	var dims = galleryDims();
	var gallery = new SlideViewer("Sample Gallery", grid.pos.x, grid.pos.y, dims[0], dims[1], gallery_images, "Open", loadSample);
	windows = append(windows, gallery);

	var intro = new Intro();
	intro.initialize();
	intro.open();
	windows = append(windows, intro);
}

function galleryDims(){
	var h = 0.9 * windowHeight;
	var ratio = 1.4;
	var w = constrain(h * ratio, 0, 0.9 * windowWidth);
	return [w, h];
}

// =======================================================================================================
// ==DRAW
// =======================================================================================================
function draw() {
	if (!detectMobile()){
		if (images_loaded == samples.length){
			if (start_time < 0)
				start_time = millis();
			if (millis() - start_time > 1500){
				fb_share_button.style.display = "block";
				styleCursor();
				background(color(windows[3].color_pickers[0].value()));

				if (fractal.creating_seed)
					grid.show();

				fractal.show();

				if (fractal.fractalizing)
					load_bar.show();

				dragTranslateShape();
				dragRotateShape();

				if(!noOpenWindows())
					showWindows();

				menu_bar.show();

				tutorial.show();
				
				if (!mouseIsPressed && !keyIsPressed && !fractal.fractalizing)
					ready = true;

				// fill(255);
				// text(mouseX + ", " + mouseY, 50, 50);
			}
			else{
				// fb_share_button.style.display = "none";
				fb_share_button.visible = false;
				loading_animation.show();
			}
		}
	}
	else
		showMobileMessage();
}

function styleCursor(){
	if (fractal.maxing_out || fractal.fractalizing)
		canvas.style.cursor = 'wait';
	else if (windows[6].visible && withinBounds(mouseX, mouseY, windows[6].ad_bounds))
		canvas.style.cursor = 'pointer';
	else if (onScreen() && noOpenWindows() && menu_bar.folderIsOpen() < 0 && drag_mode == 0 && fractal.idle())
		canvas.style.cursor = 'move';
	else 
		canvas.style.cursor = 'default';
}

// =======================================================================================================
// ==WINDOW RESIZING
// =======================================================================================================
function windowResized() {
	if (!detectMobile()){
		screen_bounds = [0, windowWidth, menu_bar.height, windowHeight];

		resizeCanvas(windowWidth, windowHeight);

		menu_bar.resize(windowWidth);

		var type = grid.type;
		grid = new Grid(windowWidth / 2, windowHeight / 2 + menu_bar.height / 2, max(windowWidth, windowHeight));
		grid.setType(type);

		var dims = galleryDims();
		windows[5].resize(dims[0], dims[1]);
		windows[6].resize();
		for (var i = 0; i < windows.length; i++)
			windows[i].setPosition(grid.pos.x, grid.pos.y);

		var d = pixelDensity();
		fractal.resize(d * windowWidth, d * windowHeight);
	}	
}

// =======================================================================================================
// ==MOUSE AND KEYBOARD EVENTS
// =======================================================================================================
function mousePressed(){
	if (!detectMobile() && mouseButton === LEFT){
		if (noOpenWindows() && ready && menu_bar.folderIsOpen() < 0)
			// Store click location globally for drag functionality
			prev_click = [mouseX, mouseY];

		if (clickout())
			closeWindows();

		// Window click events (returns true if a window was closed)
		if (menu_bar.folderIsOpen() < 0 && !noOpenWindows())
			windowMousePressEvents()

		if (tutorial.visible)
			tutorial.onClick();

		fractal.onClick();

		// Menu bar mouse events
		if (!fractal.fractalizing && ready && menu_bar.onClick())
			ready = false;
	}
}

function keyPressed(){
	if (!detectMobile()){
		menu_bar.onKeyPress();
		if (noOpenWindows() && ready){
			menu_bar.checkShortcuts();
			ready = false;
		}
		windowKeypressEvents();
	}
}

function mouseWheel(event){
	if (!detectMobile()){
		if (zoom_mode == 1)
			fractal.refreshRotationCenter();
		if (!mouseIsPressed && fractal.idle() && noOpenWindows() && onScreen())
			fractal.zoom(map(constrain(event.delta, -200, 200), -200, 200, 1.3, 0.7), zoom_mode == 0 ? [mouseX, mouseY] : [fractal.rotation_center.x, fractal.rotation_center.y]);
		return false;
	}
}

function onScreen(){
	return withinBounds(mouseX, mouseY, screen_bounds);
}

function clickout(){
	return (!noOpenWindows() && onScreen() && !withinBounds(mouseX, mouseY, currentOpenWindowBounds()) && menu_bar.folderIsOpen() < 0);
}

// =======================================================================================================
// ==Menu Bar
// =======================================================================================================
function initializeMenuBar(){
	menu_bar = new MenuBar();

	menu_bar.addFolder("Fractality");
	menu_bar.addButton("About Fractality", "", null);
	menu_bar.addButton("Welcome Screen", "W", function(){closeWindows(); windows[6].open();});
	menu_bar.addButton("Sample Gallery", "E", openGallery);
	menu_bar.addButton("Explore the Depths of the Mandelbrot Set!", "", function(){mandelbrot = true; openNewFractalWarningBox();});

	menu_bar.addFolder("File");

	menu_bar.addButton("Open File...", "O", openLoadDialog);
	menu_bar.addButton("Download as txt file...", "S", openSaveDialog);
	menu_bar.addButton("Capture Screenshot...", "D", openScreenshotDialog);

	menu_bar.addFolder("Edit");
	menu_bar.addButton("Undo", "Z", undo);
	menu_bar.addButton("Hide Edge", "H", hideEdge);
	menu_bar.addButton("Skip Edge", "J", skipEdge);
	
	menu_bar.addFolder("View");
	menu_bar.addButton("Zoom In", "+", shortcutZoomIn);
	menu_bar.addButton("Zoom Out", "-", shortcutZoomOut);
	menu_bar.addButton("Toggle Gridlines", "G", toggleGridlines);
	menu_bar.addButton("Center", "space", centerShape);
	menu_bar.addButton("Rotate Left 90°", "L", rotateLeft90);
	menu_bar.addButton("Rotate Right 90°", ";", rotateRight90);
	menu_bar.addButton("View Seed", "V", viewSeed);
	menu_bar.checkButton("View Seed");

	menu_bar.addFolder("Fractalization");
	menu_bar.addButton("Lock Seed", "enter", lockSeed);
	menu_bar.addButton("Level Up", "enter", levelUp);
	// menu_bar.addButton("Max Level Up", "M", maxOut);
	// menu_bar.addButton("Timed Level Up", ", ", null);
	menu_bar.addButton("Customize Color Scheme", "C", openColorDialog);

	menu_bar.addFolder("Tools");
	menu_bar.addButton("Zoom Mode Mouse Centered", "1", zoomModeMouse);
	menu_bar.checkButton("Zoom Mode Mouse Centered");
	menu_bar.addButton("Zoom Mode Fractal Centered", "2", zoomModeFractal);
	menu_bar.addButton("Drag Mode Translate", "3", dragModeTranslate);
	menu_bar.checkButton("Drag Mode Translate");
	menu_bar.addButton("Drag Mode Rotate", "4", dragModeRotate);

	menu_bar.addFolder("Help");
	menu_bar.addButton("Tutorial", "T", startTutorial);
	menu_bar.addButton("Learn More", "", null);

	menu_bar.initialize();

	menu_bar.enableButtons(["About Fractality", "Welcome Screen", "Sample Gallery", "Explore the Depths of the Mandelbrot Set!", "New Fractal", "Open File...", "Undo", "Toggle Gridlines", "Lock Seed", "Tutorial"]);	
}

function refreshMenuBarButtons(){
	if (fractal.creating_seed)
		menu_bar.enableButtons(["Welcome Screen", "Sample Gallery", "Explore the Depths of the Mandelbrot Set!", "New Fractal", "Open File...", "Undo", "Toggle Gridlines", "Lock Seed", "Tutorial"]);
	else if (fractal.creating_generator)
		menu_bar.enableButtons(["Welcome Screen", "Sample Gallery", "Explore the Depths of the Mandelbrot Set!", "New Fractal", "Open File...", "Skip Edge", "Hide Edge", "Undo", "Tutorial"]);
	else if (fractal.viewing_seed)
		menu_bar.enableButtons(["Welcome Screen", "Sample Gallery", "Explore the Depths of the Mandelbrot Set!", "New Fractal", "Open File...", "View Seed", "Tutorial"]);
	else
		menu_bar.enableButtons(["Welcome Screen", "Sample Gallery", "Explore the Depths of the Mandelbrot Set!", "New Fractal", "Open File...", "Level Up", 
									// "Max Level Up", "Timed Level Up", 
									"Download as txt file...", "Capture Screenshot...", "Redraw Seed", "Customize Color Scheme",   "Zoom In", "Zoom Out", "Center", "Rotate Left 90°", 
									"Rotate Right 90°", "View Seed", "Drag Mode Rotate", "Drag Mode Translate", "Zoom Mode Mouse Centered", "Zoom Mode Fractal Centered", "Tutorial"]);
}

function mouseOnMenuBar(){
	var open_folder = menu_bar.folderIsOpen();
	if (open_folder >= 0){
		var folder = menu_bar.folders[open_folder];
		for (var i = 0; i < folder.buttons.length; i++){
			if (folder.buttons[i].mouseOver())
				return true;
		}
	}
	return false;
}

function undo(){
	if (fractal.creating_seed)
		fractal.undoSeed();

	if (fractal.creating_generator)
		fractal.undoGenerator();
}

function leave(){
	if (mandelbrot)
		window.location.href = 'http://fractality.me/mandelbrot'
	setup();
	closeWindows();
}

function viewSeed(){
	fractal.viewing_seed ? fractal.viewFractal() : fractal.viewSeed();
	fractal.viewing_seed ? menu_bar.checkButton("View Seed") : menu_bar.uncheckButton("View Seed");
	refreshMenuBarButtons();
	ready = false;
}

// =======================================================================================================
// ==WINDOWS
// =======================================================================================================
function noOpenWindows(){
	for (var i = 0; i < windows.length; i++)
		if (windows[i].visible)
			return false;
	return true;
}

function currentOpenWindowBounds(){
	for (var i = 0; i < windows.length; i++)
		if (windows[i].visible)
			return windows[i].bounds;
}

function showWindows(){
	theaterMode();
	for (var i = 0; i < windows.length; i++)
		windows[i].show();
}

function theaterMode(){
	push();
		resetMatrix();
		fill(0, 150);
		noStroke();
		rect(screen_bounds[0], screen_bounds[2], screen_bounds[1] - screen_bounds[0], screen_bounds[3] - screen_bounds[2]);
	pop();
}

function closeWindows(){
	for (var i = 0; i < windows.length; i++)
		windows[i].close();
	ready = false;
}

function windowMousePressEvents(){
	for (var i = 0; i < windows.length; i++){
		// Check window click events, returns true if window was closed
		if (windows[i].onClick()){
			// If the color dialog box was closed, rescale the colours and refresh
			if (i == 3){
				fractal.scaleColors();
				fractal.refresh();
			}
			ready = false;
		}
	}
}

function windowKeypressEvents(){
	for (var i = 0; i < windows.length; i++)
		windows[i].onKeyPress();
}

function openNewFractalWarningBox(){
	if (!fractal.creating_seed){
		closeWindows();
		windows[4].open();
	}
	else
		leave();
}

function openGallery(){
	closeWindows();
	windows[5].open();
}

// =======================================================================================================
// ==TRANSLATION
// =======================================================================================================
function okayToDrag(){
	return (mouseIsPressed && fractal.idle() && onScreen() && noOpenWindows() && ready);
}

function dragTranslateShape(){
	if (okayToDrag() && drag_mode == 0){
		deltaX = mouseX - prev_click[0];
		deltaY = mouseY - prev_click[1];

		prev_click = [mouseX, mouseY];

		fractal.translate(deltaX, deltaY);
	}
}

function dragModeTranslate(){
	drag_mode = 0;
	menu_bar.checkButton("Drag Mode Translate");
	menu_bar.uncheckButton("Drag Mode Rotate");
}

function centerShape(){
	fractal.center();
}

// =======================================================================================================
// ==ROTATION
// =======================================================================================================
function dragRotateShape(){
	if (okayToDrag() && drag_mode == 1){
		fractal.refreshRotationCenter();

		var prev_angle = polarAngle(prev_click[0] - fractal.rotation_center.x, prev_click[1] - fractal.rotation_center.y);
		var current_angle = polarAngle(mouseX - fractal.rotation_center.x, mouseY - fractal.rotation_center.y);
		var delta = current_angle - prev_angle;

		prev_click = [mouseX, mouseY];

		fractal.rotate(delta);
	}
}

function dragModeRotate(){
	drag_mode = 1;
	menu_bar.uncheckButton("Drag Mode Translate");
	menu_bar.checkButton("Drag Mode Rotate");
}

function rotateLeft90(){
	fractal.refreshRotationCenter();
	fractal.rotate(-Math.PI / 2);
}

function rotateRight90(){
	fractal.refreshRotationCenter();
	fractal.rotate(Math.PI / 2);
}

// =======================================================================================================
// ==ZOOM
// =======================================================================================================
function zoomModeMouse(){
	zoom_mode = 0;
	menu_bar.checkButton("Zoom Mode Mouse Centered");
	menu_bar.uncheckButton("Zoom Mode Fractal Centered");
}

function zoomModeFractal(){
	zoom_mode = 1;
	menu_bar.checkButton("Zoom Mode Fractal Centered");
	menu_bar.uncheckButton("Zoom Mode Mouse Centered");
}

function shortcutZoomIn(){
	fractal.zoom(1.2, [fractal.rotation_center.x, fractal.rotation_center.y]);
}

function shortcutZoomOut(){
	fractal.zoom(0.8, [fractal.rotation_center.x, fractal.rotation_center.y]);
}

// =======================================================================================================
// ==SEED CREATION
// =======================================================================================================
function toggleGridlines(){
	grid.setType((grid.type + 1) % 3);
}

function lockSeed(){
	if (fractal.nodes.length < 3)
		alert("Put down at least 3 nodes to lock your seed.")
	else if (fractal.nodes[0].pos.equals(fractal.nodes[fractal.nodes.length - 2].pos))
		alert("Your seed must start and end at different positions.")
	else{
		fractal.setupForGeneratorCreation();
		refreshMenuBarButtons();
	}
}

// =======================================================================================================
// ==GENERATOR CREATION
// =======================================================================================================
function skipEdge(){
	fractal.updateGenerator(true, false);
}

function hideEdge(){
	fractal.updateGenerator(false, true);
}

function maxOut(){
	fractal.maxOut();
	ready = false;
}

function levelUp(){
	fractal.getReadyToFractalize();
}

// =======================================================================================================
// ==LOADING
// =======================================================================================================
function openLoadDialog(){
	closeWindows();
	windows[2].open();
}

function handleFile(file){
	loadSeed(split(file.data, '\n'));
}

function loadSeed(loaded_data){
	windows[2].upload_button.remove();
	windows[2].drop_area.remove();

	setup();
	fractal.creating_seed = false;
	fractal.edges_drawn = false;
	fractal.nodes = [];

	var colors = split(loaded_data[0], '%');
	for (var i = 0; i < windows[3].color_pickers.length; i++)
		windows[3].color_pickers[i].value(colors[i]);

	var specs;
	for (var i = 0; i < loaded_data.length; i++){
		if (loaded_data[i + 1] == "~")
			break;
		specs = split(loaded_data[i + 1], '%');
		fractal.nodes[i] = new FractalNode(parseFloat(specs[0]), parseFloat(specs[1]));
		if (i > 0)
			fractal.edges[i-1] = new FractalEdge(fractal.nodes[i-1].pos, fractal.nodes[i].pos, 1, parseFloat(specs[2]), color(200));
	}

	fractal.seed.recordData(fractal.nodes, fractal.edges);
	for (var i = 0; i < fractal.edges.length; i++){
		fractal.seed.types[i] = fractal.edges[i].type;
		fractal.seed.types_r[fractal.seed.types_r.length - 1 - i] = fractal.edges[i].type;
 	}

	fractal.seed.nodes = fractal.nodeCopy(fractal.nodes);
	fractal.seed.edges = fractal.edgeCopy(fractal.edges);
	fractal.refresh();
	fractal.center();
	fractal.scaleColors();
	refreshMenuBarButtons();
	closeWindows();
}

function highlightDropArea(){
	windows[0].save_button.style("z-index", "0");
	windows[1].save_button.style("z-index", "0");
	windows[2].upload_button.style("z-index", "0");
	windows[2].drop_area.style("background-color", "rgba(186, 234, 236, 0.5)");
}

function unhighlightDropArea(){
	windows[0].save_button.style("z-index", "1");
	windows[1].save_button.style("z-index", "1");
	windows[2].upload_button.style("z-index", "1");
	windows[2].drop_area.style("background", "none");
}

function loadSample(){
	loadStrings("samples/" + samples[windows[5].current_image] + ".txt", loadSeed);
}

// =======================================================================================================
// ==SAVING
// =======================================================================================================
function openSaveDialog(){
	closeWindows();
	windows[0].open();
}

function openScreenshotDialog(){
	closeWindows();
	windows[1].open();
}

function saveSeed(){
	var save_data = [];
	save_data = append(save_data, windows[3].color_pickers[0].value() + '%' + windows[3].color_pickers[1].value() + '%' 
		+ windows[3].color_pickers[2].value() + '%' + windows[3].color_pickers[3].value());
	for (var i = 0; i < fractal.seed.nodes.length; i++)
		if (i == 0)
			save_data = append(save_data, str(fractal.seed.nodes[i].pos.x) + "%" + str(fractal.seed.nodes[i].pos.y));
		else
			save_data = append(save_data, str(fractal.seed.nodes[i].pos.x) + "%" + str(fractal.seed.nodes[i].pos.y) + "%" + str(fractal.seed.edges[i-1].type));
	save_data = append(save_data, "~");
	saveStrings(save_data, save_file_name);
}

function saveScreenshot(){
	redrawFractalOnly();
	var image = screenPixels();
	if (image.width > 1024)
		image.resize(1024, 0);
	image.save(save_file_name);
}

function screenPixels(){
	var d = pixelDensity();
	var screenshot = createImage(d * (screen_bounds[1] - screen_bounds[0]), d * (screen_bounds[3] - screen_bounds[2]));
	loadPixels();
	screenshot.loadPixels();
	for (var i = 0; i < (1/d) * screenshot.width; i++){
		for (var j = 0; j < (1/d) * screenshot.height; j++){
			for (var m = 0; m < d; m++) {
				for (var n = 0; n < d; n++) {
				    var image_index = 4 * ((j * d + n) * width * d + (i * d + m));
				    var canvas_index = 4 * (((j + screen_bounds[2]) * d + n) * width * d + (i * d + m));
					screenshot.pixels[image_index] = pixels[canvas_index];
				    screenshot.pixels[image_index + 1] = pixels[canvas_index + 1];
				    screenshot.pixels[image_index + 2] = pixels[canvas_index + 2];
				    screenshot.pixels[image_index + 3] = 255;
				}
			}
		}	
	}
	screenshot.updatePixels();
	return screenshot;
}

function redrawFractalOnly(){
	// Redraw the screen with only the fractal showing
	fractal.edges_drawn = false;
	windows[1].close();
	draw();

	// Reopen screenshot dialog box, won't be shown until the next draw loop
	windows[1].open();
}

function updateSaveFileName(){
	save_file_name = this.value();
}

// =======================================================================================================
// ==COLOR SCHEMES
// =======================================================================================================
function openColorDialog(){
	closeWindows();
	windows[3].open();
}

// takes input x in [0, 1]
function colorMap(x){
	var from = x <= 0.5 ? color(windows[3].color_pickers[1].value()) : color(windows[3].color_pickers[2].value());
	var to = x <= 0.5 ? color(windows[3].color_pickers[2].value()) : color(windows[3].color_pickers[3].value());

	x = x <= 0.5 ? map(x, 0, 0.5, 0, 1) : map(x, 0.5, 1, 0, 1);

	colorMode(HSB);
	var my_color = lerpColor(from, to, x);
	colorMode(RGB);
	my_color.levels[3] = constrain(my_color.levels[3], 0, 210);
	return my_color;
}

// =======================================================================================================
// ==Tutorial
// =======================================================================================================
function startTutorial(){
	leave();
	tutorial.open();
}

function nextWindow(){
	tutorial.nextWindow();
}

function doneTutorial(){
	tutorial.close();
}

// =======================================================================================================
// ==Mobile Detection
// =======================================================================================================
function detectMobile() { 
	if (navigator.userAgent.match(/Android/i)
		|| navigator.userAgent.match(/webOS/i)
		|| navigator.userAgent.match(/iPhone/i)
		|| navigator.userAgent.match(/iPad/i)
		|| navigator.userAgent.match(/iPod/i)
		|| navigator.userAgent.match(/BlackBerry/i)
		|| navigator.userAgent.match(/Windows Phone/i)
	)
		return true;
	else
		return false;
}

function showMobileMessage() {
	background(51);
	fill(200);
	noStroke();
	textAlign(CENTER, CENTER);
	textSize(36);
	text("Sorry, this site is\nnot yet mobile friendly.", windowWidth / 2, windowHeight / 2);
}