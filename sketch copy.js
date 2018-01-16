// =======================================================================================================
// ==GLOBALS
// =======================================================================================================
var canv;
var canvas_dims = [720, 520];
var screen_bounds;

// Grid
var grid;
var show_gridlines;

// Nodes and Edges
var nodes;
var edges;
var nodes_copy;
var edges_copy;
var temp_nodes;
var temp_edges;

// Seed Creation
var creating_seed;
var creating_generator;
var seed_data;
var r_seed_data;

// Generator Creation
var idx;
var current_edge;

// Fractalization
var fractal;
var level;
var fractalize;
var edges_drawn;
var next_edge_count;
var prev_edge_count;
var max_out;

// Rotation
var rotation_center;
var drag_mode;

// Keycodes
var COMMAND_1 = 91;
var COMMAND_2 = 93;

// Zoom
var zoom_mode;

// Windows
var menu_bar;
var load_bar;
var save_dialog;
var screenshot_dialog;
var save_file_name;
var load_dialog;
var color_dialog;
var gallery;
var gallery_images = [];
var new_fractal_warning_box;
var samples = ["brushstrokes", "snowflake", "parallelogram", "sierpinski", "spiral2", "fingerprint", "pinwheel", "rhombi5", "rhombi8", 
				"honeycomb2", "spiral8", "shield", "honeycomb3", "pinwheel3", "jellyfish", "snake",  "spiral16", "rhombi2",  "spiral7", "waves", 
				"parallelogram2", "spiral6"];
var ready;

// =======================================================================================================
// ==PRELOAD AND SETUP
// =======================================================================================================
function preload(){
	for (var i = 0; i < samples.length; i++)
		gallery_images[i] = loadImage("snapshots/" + samples[i] + ".png");
}

function setup() {
	// pixelDensity(1);
	canv = createCanvas(windowWidth, windowHeight);
	angleMode(RADIANS);
	show_gridlines = true;
	creating_generator = false;

	creating_seed = true;
	fractalize = false;

	edges_drawn = true;

	nodes = [];
	edges = [];
	nodes_copy = [];
	edges_copy = [];

	seed_data = [];
	r_seed_data = [];
	types = [];

	next_edge_count = 0;
	prev_edge_count = 0;

	nodes[0] = new FractalNode(0, 0);

	initializeMenuBar();
	screen_bounds = [0, width, menu_bar.height, height];
	grid = new Grid(width / 2, height / 2 + menu_bar.height / 2, windowWidth);

	zoom_mode = 0;
	drag_mode = 0;

	load_bar = new LoadBar(screen_bounds[1] - 100, screen_bounds[3] - 15, 80, 10);

	save_file_name = '';

	save_dialog = new SaveDialogBox("Download as .txt file...", grid.pos.x, grid.pos.y, 250, 80, ".txt", saveSeed, updateSaveFileName);
	save_dialog.initialize();

	screenshot_dialog = new SaveDialogBox("Capture Screenshot...", grid.pos.x, grid.pos.y, 250, 80, ".png", saveScreenshot, updateSaveFileName);
	screenshot_dialog.initialize();

	load_dialog = new LoadDialogBox("Open File...", grid.pos.x, grid.pos.y, 250, 120, handleFile, highlightDropArea, unhighlightDropArea);
	load_dialog.initialize();

	color_dialog = new ColorDialogBox("Customize Color Scheme", grid.pos.x, grid.pos.y, 250, 110);
	color_dialog.initialize();

	var message = "Are you sure you want to start over?\nAll unsaved data will be lost.";
	new_fractal_warning_box = new WarningBox(grid.pos.x, grid.pos.y, 220, 120, message, newFractal, closeWarningBox);

	initializeSampleGallery();

	rotation_center = createVector(0, 0);

	ready = false;
	level = 1;

	var d = pixelDensity();
	fractal = createGraphics(d * windowWidth, d * windowHeight);
	max_out = false;	
}

// =======================================================================================================
// ==DRAW
// =======================================================================================================
function draw() {
	styleCursor();

	background(color(color_dialog.color_pickers[0].value()));

	if (creating_seed){
		if (show_gridlines)
			grid.show();
		updatePotentialNode();
		showSeed();
	} 

	else if (creating_generator){
		if (onScreen() && noOpenWindows() && menu_bar.folderIsOpen() < 0)
			refreshEdgeType();
		showSelection();
		edges_drawn = false;
	}

	else if (fractalize && !max_out)
		advance();

	else if (!edges_drawn)
		refresh();

	drawFractal();

	if (fractalize)
		showLoadBar();

	dragTranslateShape();
	dragRotateShape();

	if(!noOpenWindows())
		theaterMode();

	if (max_out && ready)
		maxOutAux();

	showWindows();

	menu_bar.show();
	
	if (!mouseIsPressed && !keyIsPressed && !fractalize)
		ready = true;

	// fill(255);
	// text(mouseX + ", " + mouseY, 50, 50);
	// text(okayToDrag(), 50, 50);
}

function styleCursor(){
	if (max_out || fractalize)
		canvas.style.cursor = 'wait';
	else if (onScreen() && noOpenWindows() && menu_bar.folderIsOpen() < 0 && drag_mode == 0 && !creating_seed && !creating_generator)
		canvas.style.cursor = 'move';
	else 
		canvas.style.cursor = 'default';
}

function drawFractal(){
	var d = pixelDensity();
	imageMode(CORNER);
	image(fractal, 0, 0, fractal.width / d, fractal.height / d);
}

function showWindows(){
	gallery.show();
	save_dialog.show();
	screenshot_dialog.show();
	load_dialog.show();
	color_dialog.show();
	new_fractal_warning_box.show();
}

function theaterMode(){
	push();
		resetMatrix();
		fill(0, 150);
		noStroke();
		rect(screen_bounds[0], screen_bounds[2], screen_bounds[1] - screen_bounds[0], screen_bounds[3] - screen_bounds[2]);
	pop();
}

// =======================================================================================================
// ==MOUSE AND KEYBOARD EVENTS
// =======================================================================================================
function mousePressed(){
	if (mouseButton === LEFT){
		if (noOpenWindows() && ready && menu_bar.folderIsOpen() < 0){
			// Store click location globally for drag functionality
			prev_click = [mouseX, mouseY];

			// Seed creation mouse events
			if (creating_seed && onScreen() && notDoubledUp() && menu_bar.folderIsOpen() < 0)
				updateSeed();

			// Generator creation mouse events
			if (creating_generator && onScreen() && menu_bar.folderIsOpen() < 0)
				updateGenerator(false, false);
		}

		if (clickout()){
			closeOpenWindows();
			ready = false;
		}

		// Menu bar mouse events
		if (!fractalize && ready){
			if (menu_bar.onClick())
				ready = false;
		}

		if (menu_bar.folderIsOpen() < 0 && !noOpenWindows()){
			if (save_dialog.onClick() || screenshot_dialog.onClick() || load_dialog.onClick() || color_dialog.onClick() || gallery.onClick() || new_fractal_warning_box.onClick())
				ready = false;
		}
	}
}

function keyPressed(){
	if (noOpenWindows() && ready)
		menu_bar.checkShortcuts();

	gallery.onKeyPress();
	save_dialog.onKeyPress();
	screenshot_dialog.onKeyPress();
	load_dialog.onKeyPress();
	color_dialog.onKeyPress();
	menu_bar.onKeyPress();
	new_fractal_warning_box.onKeyPress();
}

function shortcutPressed(token){
	var code = tokenToKeyCode(token);
	if (specialCharacter(token))
		return (keyCode == code)
	else
		return (key == code)
}

function tokenToKeyCode(token){
	switch(token){
		case "space" : return 32; break;
		case "enter" : return ENTER; break;
		case "+" : return 187; break;
		case "-" : return 189; break;
		case "?" : return 191; break;	
		case ";" : return 186; break;		
		default : return token;
	}
}

function specialCharacter(token){
	var chars = ["space", "enter", "+", "-", "?", ";"];
	return (chars.indexOf(token) > -1);
}

function mouseWheel(event){
	if (zoom_mode == 1)
		refreshRotationCenter();
	if (!mouseIsPressed && !creating_seed && !creating_generator && !fractalize && noOpenWindows() && onScreen())
		zoom(map(constrain(event.delta, -200, 200), -200, 200, 1.3, 0.7), zoom_mode == 0 ? [mouseX, mouseY] : [rotation_center.x, rotation_center.y]);
	return false;
}

function withinBounds(x, y, bounds){
	return (x >= bounds[0] && x <= bounds[1] && y >= bounds[2] && y <= bounds[3]);
	// 			left             right           bottom             top
}

function openGallery(){
	if (noOpenWindows())
		gallery.open();
}

function openNewFractalWarningBox(){
	if (noOpenWindows())
		new_fractal_warning_box.open();
}

function closeWarningBox(){
	new_fractal_warning_box.close();
	ready = false;
}

function clickout(){
	return (!noOpenWindows() && onScreen() && !withinBounds(mouseX, mouseY, currentOpenWindowBounds()) && menu_bar.folderIsOpen() < 0);
}

function onScreen(){
	return withinBounds(mouseX, mouseY, screen_bounds);
}

function undo(){
	if (creating_seed && nodes.length > 1)
		undoPlacedNode();

	if (creating_generator && idx < edges.length)
		undoGeneratorChoice();
}

function newFractal(){
	setup();
	gallery.close();
}

// =======================================================================================================
// ==WINDOWS
// =======================================================================================================
function noOpenWindows(){
	return (!save_dialog.visible && !screenshot_dialog.visible && !load_dialog.visible && !color_dialog.visible && !gallery.visible && !new_fractal_warning_box.visible);
}

function currentOpenWindowBounds(){
	if (save_dialog.visible)
		return save_dialog.bounds;
	if (screenshot_dialog.visible)
		return screenshot_dialog.bounds;
	if (load_dialog.visible)
		return load_dialog.bounds;
	if (gallery.visible)
		return gallery.bounds;
	if (color_dialog.visible)
		return color_dialog.bounds;
	if (new_fractal_warning_box.visible)
		return new_fractal_warning_box.bounds;
}

function closeOpenWindows(){
	save_dialog.close();
	screenshot_dialog.close();
	load_dialog.close();
	color_dialog.close();
	gallery.close();
	new_fractal_warning_box.close();
	ready = false;
}

function windowResized() {
	print(menu_bar);
	screen_bounds = [0, windowWidth, menu_bar.height, windowHeight];
	resizeCanvas(windowWidth, windowHeight);
	menu_bar.resize(windowWidth);
	var type = grid.type;
	grid = new Grid(windowWidth / 2, windowHeight / 2 + menu_bar.height / 2, max(windowWidth, windowHeight));
	grid.setType(type);
	var dims = galleryDims();
	gallery.resize(dims[0], dims[1]);
	gallery.setPosition(grid.pos.x, grid.pos.y);
	save_dialog.setPosition(grid.pos.x, grid.pos.y);
	screenshot_dialog.setPosition(grid.pos.x, grid.pos.y);
	load_dialog.setPosition(grid.pos.x, grid.pos.y);
	color_dialog.setPosition(grid.pos.x, grid.pos.y);
	new_fractal_warning_box.setPosition(grid.pos.x, grid.pos.y);
	var d = pixelDensity();
	fractal = createGraphics(d * windowWidth, d * windowHeight);
	edges_drawn = false;
}

// =======================================================================================================
// ==TRANSLATION
// =======================================================================================================
function okayToDrag(){

	// fill(255);
	// text(fractalize, 50, 90);
	// text(noOpenWindows(), 50, 130);
	// text(onScreen(), 50, 150);
	// text(ready, 50, 170);

	if (mouseIsPressed && !creating_seed && !creating_generator && !fractalize){
		if (onScreen() && noOpenWindows()&& ready)
				return true;
	}
	return false;
}

function dragTranslateShape(){
	if (okayToDrag() && drag_mode == 0){
		deltaX = mouseX - prev_click[0];
		deltaY = mouseY - prev_click[1];

		prev_click = [mouseX, mouseY];
		translateShape(deltaX, deltaY);
	}
}

function dragModeTranslate(){
	drag_mode = 0;
	menu_bar.checkButton("Drag Mode Translate");
	menu_bar.uncheckButton("Drag Mode Rotate");
}

function translateShape(deltaX, deltaY){
	for (var i = 0; i < nodes.length; i++){
		nodes[i].setPosition([nodes[i].pos.x + deltaX, nodes[i].pos.y + deltaY]);
		if (i > 0){
			edges[i-1].setStart(edges[i-1].start.x + deltaX, edges[i-1].start.y + deltaY);
			edges[i-1].setEnd(edges[i-1].end.x + deltaX, edges[i-1].end.y + deltaY);
		}
	}

	for (var i = 0; i < nodes_copy.length; i++){
		nodes_copy[i].setPosition([nodes_copy[i].pos.x + deltaX, nodes_copy[i].pos.y + deltaY]);
		if (i > 0){
			edges_copy[i-1].setStart(edges_copy[i-1].start.x + deltaX, edges_copy[i-1].start.y + deltaY);
			edges_copy[i-1].setEnd(edges_copy[i-1].end.x + deltaX, edges_copy[i-1].end.y + deltaY);
		}
	}

	edges_drawn = false;
}

// =======================================================================================================
// ==ROTATION
// =======================================================================================================
function dragRotateShape(){
	if (okayToDrag() && drag_mode == 1){
		refreshRotationCenter();
		var prev_angle = polarAngle(prev_click[0] - rotation_center.x, prev_click[1] - rotation_center.y);
		var current_angle = polarAngle(mouseX - rotation_center.x, mouseY - rotation_center.y);
		var delta = current_angle - prev_angle;
		prev_click = [mouseX, mouseY];
		rotateShape(delta);
	}
}

function dragModeRotate(){
	drag_mode = 1;
	menu_bar.uncheckButton("Drag Mode Translate");
	menu_bar.checkButton("Drag Mode Rotate");
}

function refreshRotationCenter(){
	rotation_center.set(0, 0)
	var normalizer = 0;
	for (var i = 0; i < edges.length; i++){
		if (edges[i].type < 5){
			rotation_center.add(edges[i].midpoint());
			normalizer++;
		}
	}
	rotation_center.mult(1 / normalizer);
}

function rotateShape(angle){
	for (var i = 0; i < nodes.length; i++){
		nodes[i].rotate(angle, rotation_center);
		if (i > 0)
			edges[i-1].rotate(angle, rotation_center);
	}

	for (var i = 0; i < nodes_copy.length; i++){
		nodes_copy[i].rotate(angle, rotation_center);
		if (i > 0)
			edges_copy[i-1].rotate(angle, rotation_center);
	}
	edges_drawn = false;
}

function rotateLeft(){
	refreshRotationCenter();
	rotateShape(-Math.PI / 2);
}

function rotateRight(){
	refreshRotationCenter();
	rotateShape(Math.PI / 2);
}

function centerShape(){
	refreshRotationCenter();
	if (edgeOnScreen()) {
		var deltaX = grid.pos.x - rotation_center.x;
		var deltaY = grid.pos.y - rotation_center.y;
		translateShape(deltaX, deltaY);
	}
}

function edgeOnScreen(){
	for (var i = 0; i < edges.length; i++){
		if (edges[i].type < 5 && edges[i].onScreen())
			return true;
	}
	return false;
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

function zoom(delta, center){
	for (var i = 0; i < nodes.length; i++){
		new_pos = scalePoint(nodes[i].pos.x, nodes[i].pos.y, delta, center);
		nodes[i].setPosition([new_pos[0], new_pos[1]]);
		if (i > 0){
			new_start = scalePoint(edges[i-1].start.x, edges[i-1].start.y, delta, center);
			edges[i-1].setStart(new_start[0], new_start[1]);

			new_end = scalePoint(edges[i-1].end.x, edges[i-1].end.y, delta, center);
			edges[i-1].setEnd(new_end[0], new_end[1]);
		}
	}

	for (var i = 0; i < nodes_copy.length; i++){
		new_pos = scalePoint(nodes_copy[i].pos.x, nodes_copy[i].pos.y, delta, center);
		nodes_copy[i].setPosition([new_pos[0], new_pos[1]]);
		if (i > 0){
			new_start = scalePoint(edges_copy[i-1].start.x, edges_copy[i-1].start.y, delta, center);
			edges_copy[i-1].setStart(new_start[0], new_start[1]);

			new_end = scalePoint(edges_copy[i-1].end.x, edges_copy[i-1].end.y, delta, center);
			edges_copy[i-1].setEnd(new_end[0], new_end[1]);
		}
	}

	edges_drawn = false;
}

function shortcutZoomIn(){
	zoom(1.2, [rotation_center.x, rotation_center.y]);
}

function shortcutZoomOut(){
	zoom(0.8, [rotation_center.x, rotation_center.y]);
}

function scalePoint(x, y, delta, center){
	x = x - center[0];
	y = y - center[1];

	var r = pow(pow(x, 2) +  pow(y, 2), 0.5);
	var theta = polarAngle(x, y);

	var new_x = delta * r * cos(theta) + center[0];
	var new_y = delta * r * sin(theta) + center[1];

	return [new_x, new_y];
}

// =======================================================================================================
// ==SEED CREATION
// =======================================================================================================
function updatePotentialNode(){
	if (onScreen()){
		var snap = [99999999, 99999999];
		if (grid.type == 0 || grid.type == 1)
			snap = closestGridPoint(mouseX, mouseY, grid.coords);
		if (withinBounds(snap[0], snap[1], screen_bounds))
			nodes[nodes.length - 1].setPosition(snap);
		else
			nodes[nodes.length - 1].setPosition([mouseX, mouseY]);
	}

	if (edges.length > 0)
		edges[edges.length - 1].setEnd(nodes[nodes.length - 1].pos.x, nodes[nodes.length - 1].pos.y);
}

// Returns the closest grid coordinate to the point (x,y)
function closestGridPoint(x, y, coords){
	closest_dist = 10000;
	closest_pos = [-1, -1];
	var d;
	for (var i = 0; i < coords.length; i++){
		for (var j = 0; j < coords.length; j++){
			d = dist(coords[i][j][0], coords[i][j][1], x, y);
			if (d < closest_dist){
				closest_dist = d;
				closest_pos = coords[i][j];
			}
		}
	}
	return closest_pos;
}

function updateSeed(){
	nodes = append(nodes, new FractalNode(0, 0));
	edges = append(edges, new FractalEdge(nodes[nodes.length - 2].pos, nodes[nodes.length - 1].pos, 2, 0, [200, 200, 200]));
}

function showSeed(){
	fractal.clear();
	if (onScreen() && noOpenWindows() && menu_bar.folderIsOpen() < 0){
		for (var i = 0; i < edges.length; i++)
			edges[i].show();

		for (var i = 0; i < nodes.length; i++)
			nodes[i].show();
	}
	else{
		for (var i = 0; i < edges.length - 1; i++)
			edges[i].show();

		for (var i = 0; i < nodes.length - 1; i++)
			nodes[i].show();
	}
}

function undoPlacedNode(){
	nodes.splice(nodes.length-1, 1);
	edges.splice(nodes.length-1, 1);
}

function notDoubledUp(){
	if (nodes.length < 2)
		return true;
	return !(nodes[nodes.length - 2].pos.equals(nodes[nodes.length - 1].pos));
}

function toggleGridlines(){
	grid.setType((grid.type + 1) % 3);
	grid.type == 2 ? show_gridlines = false : show_gridlines = true;
}

function redrawSeed(){
	nodes = nodeCopy(nodes_copy);
	edges = edgeCopy(edges_copy);
	updateSeed();
	creating_seed = true;
	grid.setType(2);
	menu_bar.enableButtons(["About FractalSandbox", "New Fractal", "Open File...", "Undo", "Toggle Gridlines", "Lock Seed", "Sample Gallery"]);
}

// =======================================================================================================
// ==GENERATOR CREATION
// =======================================================================================================
function setupForGenerator(){
	nodes.splice(nodes.length - 1, 1);
	edges.splice(edges.length - 1, 1);

	for (var i = 0; i < edges.length; i++)
		edges[i].setWeight(1);

	getSeedData();

	nodes_copy = nodeCopy(nodes);
	edges_copy = edgeCopy(edges);

	menu_bar.enableButtons(["About FractalSandbox", "Skip Edge", "Hide Edge", "Undo", "Open File...", "New Fractal", "Sample Gallery"]);

	idx = nodes.length - 1;
	creating_seed = false;
	creating_generator = true;
}

function refreshEdgeType(){
	if (aboveLine(mouseX, mouseY, nodes[idx - 1].pos.x, nodes[idx - 1].pos.y, nodes[idx].pos.x, nodes[idx].pos.y)){
		if (toTheLeft(mouseX, mouseY, nodes[idx - 1].pos.x, nodes[idx - 1].pos.y, nodes[idx].pos.x, nodes[idx].pos.y)){
			edges[idx - 1].setType(1);
			edges_copy[idx - 1].setType(1);
		}
		else{
			edges[idx - 1].setType(0);
			edges_copy[idx - 1].setType(0);
		}
	}
	else{
		if (toTheLeft(mouseX, mouseY, nodes[idx - 1].pos.x, nodes[idx - 1].pos.y, nodes[idx].pos.x, nodes[idx].pos.y)){
			edges[idx - 1].setType(3);
			edges_copy[idx - 1].setType(3);
		}
		else {
			edges[idx - 1].setType(2);
			edges_copy[idx - 1].setType(2);
		}
	}
}

// Determine if the point (x, y) is "above" the line (x1, y1) --> (x2, y2)
function aboveLine(x, y, x1, y1, x2, y2){
	if (x2 >= x1){
		var m = slope(x1, y1, x2, y2);
		if (m == 1000000) // check for vertical line
			if (y2 > y1)
				return x > x1;
			else
				return x < x1;
		var b = intercept(m, x1, y1);
		return y < m * x + b;
	}
	else {
		var m = slope(x2, y2, x1, y1);
		if (m == 1000000)
			if (y2 > y1)
				return x > x1;
			else
				return x < x1;
		var b = intercept(m, x1, y1);
		return y > m * x + b;
	}	
}

// Determine if the point (x, y) is "to the left" of the line perpendicular to the line (x1, y1) --> (x2, y2)
// and passing through it's midpoint
function toTheLeft(x, y, x1, y1, x2, y2){
	var vec = createVector(x2 - x1, y2 - y1);
	var perp_vec = createVector(1, -vec.x/vec.y);
	var mid = midpoint(x1, y1, x2, y2);
	if (vec.y == 0){
		if (x2 > x1)
			return x < mid[0]
		else
			return x > mid[0]
	}
	var end = [mid[0] + perp_vec.x, mid[1] + perp_vec.y];

	if (end[1] < mid[1])
		return aboveLine(x, y, mid[0], mid[1], end[0], end[1]);
	else
		return aboveLine(x, y, end[0], end[1], mid[0], mid[1]);
}

function undoGeneratorChoice(){
	edges[idx].setType(0);
	edges_copy[idx].setType(0);
	seed_data[idx][2] = 0;
	r_seed_data[r_seed_data.length - idx - 1][2] = 0;
	var stop = idx + 1;
	edges = edgeCopy(edges_copy);
	nodes = nodeCopy(nodes_copy);
	idx = nodes.length - 1;
	for (var i = edges.length - 1; i >= stop; i--){
		if (edges[i].type == 4)
			updateGenerator(true, false);
		else if (edges[i].type == 5)
			updateGenerator(false, true);
		else
			updateGenerator(false, false);
	}
	refresh();
}

function showSelection(){
	fractal.clear();
	var result = subdivide(idx);
	temp_nodes = result[0];
	temp_edges = result[1];

	for (var i = 0; i < idx - 1; i++)
		edges[i].show();

	if (onScreen()){
		for (var i = 0; i < temp_edges.length; i++)
			if (temp_edges[i].type < 5)
				temp_edges[i].show();
	}
	else if (edges[idx - 1].type < 5)
		edges[idx - 1].show();

	for (var i = idx; i < edges.length; i++)
		if (edges[i].type < 5)
			edges[i].show();

	for (var i = 0; i < nodes_copy.length; i++)
		nodes_copy[i].show();
}

function skipEdge(){
	updateGenerator(true, false);
}

function hideEdge(){
	updateGenerator(false, true);
}

function subdivide(idx){
	var new_base = createVector(nodes[idx].pos.x - nodes[idx - 1].pos.x, nodes[idx].pos.y - nodes[idx - 1].pos.y);
	var angle_offset = polarAngle(new_base.x, new_base.y);
	var mag_scaler = new_base.mag();
	var new_nodes = [];
	var new_edges = [];
	var x, y;

	// Determine whether to read the seed in forward or reverse order
	var data;
	if (edges[idx - 1].type == 1 || edges[idx - 1].type == 3)
		data = r_seed_data;
	else 
		data = seed_data;

	// Determine whether to flip the seed
	var neg;
	if (edges[idx - 1].type == 0 || edges[idx - 1].type == 3)
		neg = -1;
	else 
		neg = 1;

	// For each new node in the seed
	for (var j = 0; j < data.length - 1; j++) {
		// Get the new node's coordinates
		x = nodes[idx-1].pos.x + data[j][0] * mag_scaler * Math.cos(neg * data[j][1] + angle_offset);
		y = nodes[idx-1].pos.y + data[j][0] * mag_scaler * Math.sin(neg * data[j][1] + angle_offset);

		// Add a node with these coordinates to the nodes array
		new_nodes = append(new_nodes, new FractalNode(x, y));

		// Get type for new edge
		var new_type = getNewType(edges[idx - 1].type, data, j);

		// Add an edge between this node and the previous one
		if (j-1 >= 0)
			new_edges = append(new_edges, new FractalEdge(new_nodes[j-1].pos, new_nodes[j].pos, 1, new_type, [200, 200, 200]));
		// 													start                 end   weight  type         stroke
		else
			new_edges = append(new_edges, new FractalEdge(nodes[idx-1].pos, new_nodes[j].pos, 1, new_type, [200, 200, 200]));
	}

	// Finally, add an edge connecting the last node in the seed to the next node in nodes
	new_type = getNewType(edges[idx - 1].type, data, data.length - 1);
	new_edges = append(new_edges, new FractalEdge(new_nodes[new_nodes.length - 1].pos, nodes[idx].pos, 1, new_type, [200, 200, 200]));

	return [new_nodes, new_edges];
}

function getNewType(current_type, data, j){
	var new_type;
	switch(data[j][2]){
		case 0: new_type = current_type; break;
		case 1:
			switch(current_type){
				case 0: new_type = 1; break;
				case 1: new_type = 0; break;
				case 2: new_type = 3; break;
				case 3: new_type = 2; break;
			} break;
		case 2:
			switch(current_type){
				case 0: new_type = 2; break;
				case 1: new_type = 3; break;
				case 2: new_type = 0; break;
				case 3: new_type = 1; break;
			} break;
		case 3: 
			switch(current_type){
				case 0: new_type = 3; break;
				case 1: new_type = 2; break;
				case 2: new_type = 1; break;
				case 3: new_type = 0; break;
			} break;
	}
	if (current_type == 4 || data[j][2] == 4)
		new_type = 4;

	if (current_type == 5 || data[j][2] == 5)
		new_type = 5;

	return new_type;
}

function updateGenerator(skip, hide){
	if (!skip && !hide){
		edges_copy[idx-1].setType(edges[idx-1].type);
		seed_data[idx-1][2] = edges[idx-1].type;
		r_seed_data[r_seed_data.length - idx][2] = edges[idx-1].type;
	}
	else if (skip){
		edges_copy[idx-1].setType(4);
		seed_data[idx-1][2] = 4;
		r_seed_data[r_seed_data.length - idx][2] = 4;
	}
	else if (hide){
		edges_copy[idx-1].setType(5);
		seed_data[idx-1][2] = 5;
		r_seed_data[r_seed_data.length - idx][2] = 5;
	}

	edges = edgeCopy(edges_copy);
	nodes = nodeCopy(nodes_copy);
	for (var i = edges.length - 1; i >= idx - 1; i--){
		if (edges[i].type < 4)
			update(i + 1);
	}

	idx--;
	if (idx == 0){
		nodes = nodeCopy(nodes_copy);
		edges = edgeCopy(edges_copy);
		scaleColors();
		refreshRotationCenter();
		creating_generator = false;
		menu_bar.enableButtons(["About FractalSandbox", "Level Up", "Max Level Up", "Timed Level Up", "Download as .txt file...", "Capture Screenshot...", "Open File...", 
								"Redraw Seed", "Customize Color Scheme", "New Fractal", "Sample Gallery", "Zoom In", "Zoom Out", "Zoom Mode Mouse Centered", 
								"Zoom Mode Fractal Centered", "Center", "Rotate Left 90°", "Rotate Right 90°", "Drag Mode Rotate", "Drag Mode Translate"]);
	}
}

function setEdgeTypes(edges){
	for (var i = 0; i < edges.length; i++){
		edges[i].setType(seed_data[i % seed_data.length][2]);
	}
}

function getSeedData(){
	var base = createVector(nodes[nodes.length-1].pos.x - nodes[0].pos.x, nodes[nodes.length-1].pos.y - nodes[0].pos.y);
	var sub = createVector(0, 0);
	var r_base = createVector(nodes[0].pos.x - nodes[nodes.length-1].pos.x, nodes[0].pos.y - nodes[nodes.length-1].pos.y);
	var r_sub = createVector(0, 0);
	for (var i = 0; i < nodes.length - 2; i++){
		// SEED DATA - FORWARD DIRECTION
		// Record the polar coordinates of the seed nodes with respect to the vector n1->n2
		sub.x = nodes[i+1].pos.x - nodes[0].pos.x;
		sub.y = nodes[i+1].pos.y - nodes[0].pos.y;
		seed_data[i] = [];
		seed_data[i][0] = sub.mag() * 1.0 / base.mag();
		seed_data[i][1] = angleBetween(sub, base);
		seed_data[i][2] = 0;

		// SEED DATA - REVERSE DIRECTION
		// Record the polar coordinates of the seed nodes with respect to the vector n2->n1
		r_sub.x = nodes[nodes.length - 2 - i].pos.x - nodes[nodes.length - 1].pos.x;
		r_sub.y = nodes[nodes.length - 2 - i].pos.y - nodes[nodes.length - 1].pos.y;
		r_seed_data[i] = [];
		r_seed_data[i][0] = r_sub.mag() * 1.0 / r_base.mag();
		r_seed_data[i][1] = angleBetween(r_sub, r_base);
		r_seed_data[i][2] = 0;
	}

	// Add dummy data point at the end to hold type of final edge connecting the seed back to the shape
	seed_data[nodes.length - 2] = [0, 0, 0];
	r_seed_data[nodes.length -2] = [0, 0, 0];
}

function lockSeed(){
	if (nodes.length < 3)
		alert("Put down at least 3 nodes to lock your seed.")
	else if (nodes[0].pos.equals(nodes[nodes.length - 2].pos))
		alert("Your seed must start and end at different positions.")
	else
		setupForGenerator();

}

// =======================================================================================================
// ==FRACTALIZATION
// =======================================================================================================
function getReadyToFractalize(){
	if (!fractalize){
		fractal.clear();
		prev_edge_count = edges.length;

		var num_unreplaced = 0;
		for (var i = 0; i < edges.length; i++){
			if (edges[i].type > 3)
				num_unreplaced++;
		}

		next_edge_count = num_unreplaced + (edges.length - num_unreplaced) * seed_data.length;
		if (next_edge_count <= 50000){
			current_edge = edges.length;
			fractalize = true;
			level++;
		}
		else if (!max_out){
			nodes = nodeCopy(nodes_copy);
			edges = edgeCopy(edges_copy);
			edges_drawn = false;
			level = 1;
			scaleColors();
		}

		background(color(color_dialog.color_pickers[0].value()));
	}	
}

function advance(){
	speed = constrain(floor(edges.length / 50), 20, 200);
	for (var i = 0; i < speed; i++){
		if (edges[current_edge - 1].type < 4)
			update(current_edge);
		else if (edges[current_edge - 1].type == 4 && !max_out)
			edges[current_edge - 1].show();
		current_edge--;
		if (current_edge == 0){
			fractalize = false;
			edges_drawn = false;
			break;
		}
	}
}

function update(e){
	var result = subdivide(e);
	temp_nodes = result[0];
	temp_edges = result[1];
	edges.splice(e - 1, 1);
	edges = splice(edges, temp_edges, e - 1);
	nodes = splice(nodes, temp_nodes, e);

	if (fractalize && !max_out)
		for (var i = temp_edges.length - 1; i >= 0; i--)
			if (temp_edges[i].type < 5)
				temp_edges[i].show();
}

function maxOut(){
	max_out = true;
	ready = false;
}

function maxOutAux(){
	var start_time = millis();
	while (true) {
		getReadyToFractalize();
		if (next_edge_count <= 50000 && millis() - start_time < 12500){
			while (current_edge > 0)
				advance();
		}
		else break;
	} 
	scaleColors();
	max_out = false;
	ready = false;
}

function refresh(){
	fractal.clear();
	background(color(color_dialog.color_pickers[0].value()));;
	var normalizer = 0;
	for (var i =  edges.length - 1; i >= 0; i--){
		if (edges[i].type != 5 && edges[i].onScreen()){
			edges[i].show();
			normalizer++;
		}
	}
	edges_drawn = true;
}

function scaleColors(){
	var l = edges.length;
	var r, g, b;
	for (var i = 0; i < l; i++){
		// Map position in edges array to value between 0 and 1
		var x = map(i, 0, l-1, 0, 1);
		edges[i].setStroke(colorMap(x));
	}
}

function showLoadBar(){
	if (next_edge_count > 100){
		load_bar.setPercentage((edges.length - prev_edge_count) / (next_edge_count - prev_edge_count));
		load_bar.show();
	}
}

// =======================================================================================================
// ==AUXILLARY MATH FUNCTIONS
// =======================================================================================================
function angleBetween(v1, v2){
	return polarAngle(v2.x, v2.y) - polarAngle(v1.x, v1.y);
}

function dot(v1, v2){
	return v1.x*v2.x + v1.y*v2.y;
}

// Return the slope of the line  (x1, y1) --> (x2, y2)
function slope(x1, y1, x2, y2){
	if (x2 - x1 == 0) 
		return 1000000;
	else
		return (y2 - y1) / (x2 - x1);
}

// Determine the y intercept of the line y = mx + b given m, x and y
function intercept(m, x, y){
	return y - m*x;
}

// Return the midpoint of the line (x1, y1) --> (x2, y2)
function midpoint(x1, y1, x2, y2){
	return [(x1 + x2) / 2, (y1 + y2) / 2];
}

function polarAngle(x, y){
	if (x > 0 && y > 0)
		return Math.atan(abs(y) / abs(x));
	else if (x < 0 && y > 0)
		return Math.PI - Math.atan(abs(y) / abs(x));
	else if (x > 0 && y < 0)
		return 2*Math.PI - Math.atan(abs(y) / abs(x));
	else if (x < 0 && y < 0)
		return Math.PI + Math.atan(abs(y) / abs(x));
	else if (x == 0 && y > 0)
		return Math.PI / 2;
	else if (x == 0 && y < 0)
		return 3*Math.PI / 2;
	else if (x < 0 && y == 0)
		return Math.PI;
	else
		return 0;
}

// =======================================================================================================
// ==LOADING
// =======================================================================================================
function nodeCopy(n){
	if (n.length > 1){
		var result = [];
		for (var i = 0; i < n.length; i++)
			result[i] = new FractalNode(n[i].pos.x, n[i].pos.y);
	}
	else
		return new FractalNode(n[0].pos.x, n[0].pos.y);
	return result;
}

function edgeCopy(e){
	var result = [];
	for (var i = 0; i < e.length; i++)
		result[i] = new FractalEdge(e[i].start, e[i].end, e[i].weight, e[i].type, e[i].stroke);
	return result;
}

function openLoadDialog(){
	if (noOpenWindows())
		load_dialog.open();
}

function handleFile(file){
	loadSeed(split(file.data, '\n'));
}

function loadSeed(loaded_data){
	load_dialog.upload_button.remove();
	load_dialog.drop_area.remove();

	setup();
	creating_seed = false;
	edges_drawn = false;
	nodes = [];

	var colors = split(loaded_data[0], '%');
	for (var i = 0; i < color_dialog.color_pickers.length; i++)
		color_dialog.color_pickers[i].value(colors[i]);

	var specs;
	for (var i = 0; i < loaded_data.length; i++){
		if (loaded_data[i + 1] == "~")
			break;
		specs = split(loaded_data[i + 1], '%');
		nodes[i] = new FractalNode(parseFloat(specs[0]), parseFloat(specs[1]));
		if (i > 0)
			edges[i-1] = new FractalEdge(nodes[i-1].pos, nodes[i].pos, 1, parseFloat(specs[2]), [200, 200, 200]);
	}

	getSeedData();
	for (var i = 0; i < edges.length; i++){
		seed_data[i][2] = edges[i].type;
		r_seed_data[r_seed_data.length - 1 - i][2] = edges[i].type;
 	}

	nodes_copy = nodeCopy(nodes);
	edges_copy = edgeCopy(edges);
	refresh();
	centerShape();
	scaleColors();
	menu_bar.enableButtons(["About FractalSandbox", "Level Up", "Max Level Up", "Timed Level Up", "Download as .txt file...", "Capture Screenshot...", "Open File...", 
							"Redraw Seed", "Customize Color Scheme", "New Fractal", "Sample Gallery", "Zoom In", "Zoom Out", "Zoom Mode Mouse Centered", 
							"Zoom Mode Fractal Centered", "Center", "Rotate Left 90°", "Rotate Right 90°", "Drag Mode Rotate", "Drag Mode Translate"]);
	gallery.close();
}

function highlightDropArea(){
	load_dialog.upload_button.style("z-index", "0");
	save_dialog.save_button.style("z-index", "0");
	screenshot_dialog.save_button.style("z-index", "0");
	load_dialog.drop_area.style("background-color", "rgba(186, 234, 236, 0.5)");
}

function unhighlightDropArea(){
	load_dialog.upload_button.style("z-index", "1");
	save_dialog.save_button.style("z-index", "1");
	screenshot_dialog.save_button.style("z-index", "1");
	load_dialog.drop_area.style("background", "none");
}

function initializeSampleGallery(){
	var dims = galleryDims();
	gallery = new SlideViewer("Sample Gallery", grid.pos.x, grid.pos.y, dims[0], dims[1], gallery_images, "Open", loadSample);
	gallery.open();
}

function galleryDims(){
	return [constrain(0.65*windowHeight*1.2, 0, windowWidth * 0.9), 0.65*windowHeight];
}

function loadSample(){
	loadStrings("samples/" + samples[gallery.current_image] + ".txt", loadSeed);
}

// =======================================================================================================
// ==SAVING
// =======================================================================================================
function openSaveDialog(){
	if (noOpenWindows())
		save_dialog.open();
}

function openScreenshotDialog(){
	if (noOpenWindows())
		screenshot_dialog.open();
}

function saveSeed(){
	var save_data = [];
	save_data = append(save_data, color_dialog.color_pickers[0].value() + '%' + color_dialog.color_pickers[1].value() + '%' 
		+ color_dialog.color_pickers[2].value() + '%' + color_dialog.color_pickers[3].value());
	for (var i = 0; i < nodes_copy.length; i++)
		if (i == 0)
			save_data = append(save_data, str(nodes_copy[i].pos.x) + "%" + str(nodes_copy[i].pos.y));
		else
			save_data = append(save_data, str(nodes_copy[i].pos.x) + "%" + str(nodes_copy[i].pos.y) + "%" + str(edges_copy[i-1].type));
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
	edges_drawn = false;
	screenshot_dialog.close();
	draw();

	// Reopen screenshot dialog box, won't be shown until the next draw loop
	screenshot_dialog.open();
}

function updateSaveFileName(){
	save_file_name = this.value();
}

// =======================================================================================================
// ==Menu Bar
// =======================================================================================================
function initializeMenuBar(){
	menu_bar = new MenuBar();

	menu_bar.addFolder("FractalSandbox");
	menu_bar.addButton("About FractalSandbox", "", null);
	menu_bar.addButton("Sample Gallery", "W", openGallery);

	menu_bar.addFolder("File");
	menu_bar.addButton("New Fractal", "N", openNewFractalWarningBox);
	menu_bar.addButton("Open File...", "O", openLoadDialog);
	menu_bar.addButton("Download as .txt file...", "S", openSaveDialog);
	menu_bar.addButton("Capture Screenshot...", "D", openScreenshotDialog);
	menu_bar.addButton("Redraw Seed", "R", redrawSeed);

	menu_bar.addFolder("Edit");
	menu_bar.addButton("Undo", "Z", undo);
	menu_bar.addButton("Hide Edge", "H", hideEdge);
	menu_bar.addButton("Skip Edge", "J", skipEdge);
	
	menu_bar.addFolder("View");
	menu_bar.addButton("Zoom In", "+", shortcutZoomIn);
	menu_bar.addButton("Zoom Out", "-", shortcutZoomOut);
	menu_bar.addButton("Zoom Mode Mouse Centered", "1", zoomModeMouse);
	menu_bar.checkButton("Zoom Mode Mouse Centered");
	menu_bar.addButton("Zoom Mode Fractal Centered", "2", zoomModeFractal);
	menu_bar.addButton("Toggle Gridlines", "G", toggleGridlines);
	menu_bar.addButton("Center", "space", centerShape);
	menu_bar.addButton("Rotate Left 90°", "L", rotateLeft);
	menu_bar.addButton("Rotate Right 90°", ";", rotateRight);
	menu_bar.addButton("Drag Mode Translate", "3", dragModeTranslate);
	menu_bar.checkButton("Drag Mode Translate");
	menu_bar.addButton("Drag Mode Rotate", "4", dragModeRotate);

	menu_bar.addFolder("Fractalization");
	menu_bar.addButton("Lock Seed", "enter", lockSeed);
	menu_bar.addButton("Level Up", "enter", getReadyToFractalize);
	menu_bar.addButton("Max Level Up", "M", maxOut);
	menu_bar.addButton("Timed Level Up", ", ", null);
	menu_bar.addButton("Customize Color Scheme", "C", openColorDialog);

	menu_bar.addFolder("Help");
	menu_bar.addButton("Tutorial", "T", null);
	menu_bar.addButton("Learn More", "", null);

	menu_bar.initialize();

	menu_bar.enableButtons(["About FractalSandbox", "New Fractal", "Open File...", "Undo", "Toggle Gridlines", "Lock Seed", "Sample Gallery"]);
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

// =======================================================================================================
// ==COLOR SCHEMES
// =======================================================================================================
function openColorDialog(){
	if (noOpenWindows())
		color_dialog.open();
}

// takes input x in [0, 1]
function colorMap(x){
	var from = x <= 0.5 ? color(color_dialog.color_pickers[1].value()) : color(color_dialog.color_pickers[2].value());
	var to = x <= 0.5 ? color(color_dialog.color_pickers[2].value()) : color(color_dialog.color_pickers[3].value());

	x = x <= 0.5 ? map(x, 0, 0.5, 0, 1) : map(x, 0.5, 1, 0, 1);

	colorMode(HSB);
	var my_color = lerpColor(from, to, x);
	colorMode(RGB);
	my_color.levels[3] = constrain(my_color.levels[3], 0, 210);
	return my_color;
}