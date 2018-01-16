// =======================================================================================================
// ==GLOBALS
// =======================================================================================================
var sandbox;
var show_gridlines;
var nodes;
var edges;
var nodes_copy;
var edges_copy;
var temp_nodes;
var temp_edges;
var creating_seed;
var creating_generator;
var seed_data;
var r_seed_data;
var idx;
var fractalize;
var current_edge;
var edges_drawn;
var control_box;
var screen_bounds = [0, 720, 3, 455];
var load_bar;
var next_edge_count;
var prev_edge_count;
var prev_click;
var canvas_dims = [720, 520];
var upload_button;
var drop_area;
var loading_seed;
var ready_to_load;
var show_upload_button;
var show_drop_area;
var saving_seed;
var save_file_name;
var text_input;
var save_button;
var screenshot_button;
var show_text_input;
var show_save_button;
var show_screenshot_button;
var button_labels;
var button_indices;
var file_browser;
var loading_sample_seed;
var ready;
var help;
var help_screen;
var help_images = [];
var cursor_image;
var zoom_image;
var cursor_control;
var zoom_mode;
var dragging_cursor_control;
var exit_button;
var capturing_screen;
var level;

// =======================================================================================================
// ==PRELOAD AND SETUP
// =======================================================================================================
function preload(){
	for (var i = 0; i < 4; i++)
		help_images[i] = loadImage("help_menu/help" + i + ".png");

	cursor_image = loadImage("cursor.png");
	zoom_image = loadImage("zoom.png");
}

function setup() {
	createCanvas(canvas_dims[0], canvas_dims[1]);
	angleMode(RADIANS);
	show_gridlines = true;

	creating_seed = true;
	creating_generator = false;
	fractalize = false;

	edges_drawn = true;

	sandbox = new Sandbox(width / 2, height / 2 - 32, 720);

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

	button_labels = ["CONTINUE", "FRACTALIZE", "SKIP\nEDGE", "HIDE\nEDGE", "UNDO", "SAVE", "LOAD", "COLOR\nSCHEME", "GRID\nLINES", "RESTART", "HELP"];
	button_indices = [  1,            -1,           -1,           -1,         1,     -1,      1,          -1,           1,             1,        1];
	refreshControlBox(button_labels, button_indices);

	exit_button = new ExitButton(0, 0);
	exit_button.setPosition(sandbox.pos.x + 257, sandbox.pos.y - 195);

	load_bar = new LoadBar(screen_bounds[1] - 100, screen_bounds[3] - 15, 80, 10);

	upload_button = createFileInput(handleFile);
	upload_button.position(sandbox.pos.x - 80, sandbox.pos.y - 5);
	show_upload_button = false;

	drop_area = createP('Drop File Here');
	drop_area.position(sandbox.pos.x - 80, sandbox.pos.y - 70);
	styleDropArea();
	drop_area.dragOver(highlightDropArea);
	drop_area.dragLeave(unhighlightDropArea);
	drop_area.drop(handleFile);
	show_drop_area = false;

	loading_seed = false;
	ready_to_load = false;

	saving_seed = false;
	save_file_name = 'untitled';

	text_input = createInput('enter filename');
	text_input.position(sandbox.pos.x - 60, sandbox.pos.y - 20);
	text_input.input(updateSaveFileName);
	show_text_input = false;

	save_button = createButton('save seed as file');
	save_button.position(sandbox.pos.x - 45, sandbox.pos.y + 7);
	save_button.mousePressed(saveSeed);
	show_save_button = false;

	screenshot_button = createButton('save screenshot as image');
	screenshot_button.position(sandbox.pos.x - 70, sandbox.pos.y + 30);
	screenshot_button.mousePressed(saveScreenshot);
	show_screenshot_button = false;

	loading_sample_seed = false;
	var file_names = ["sierpinski.txt", "snowflakeA.txt", "snowflakeB.txt", "zigzag.txt", "tree.txt", "koch.txt", "spike.txt"];
	var aliases = ["Sierpinski", "Snowflake A", "Snowflake B", "Zig Zag", "Tree", "Koch", "Spike"];
	file_browser = new FileBrowser(file_names, aliases, "Sample Seeds", sandbox.pos.x, sandbox.pos.y, 200, 300);

	help = true;
	help_screen = new HelpScreen(sandbox.pos.x, sandbox.pos.y, 0.75 * width, 0.8 * height, help_images);

	cursor_control = new CursorControl(20, 20);
	zoom_mode = false;
	dragging_cursor_control = false;

	ready = false;
	level = 1;
}

// =======================================================================================================
// ==DRAW
// =======================================================================================================
function draw() {
	if (zoom_mode && withinBounds(mouseX, mouseY, screen_bounds))
		cursor(CROSS)
	else
		cursor(ARROW)

	if (creating_seed || creating_generator || fractalize){
		background(51);
	}

	if (creating_seed){
		if (show_gridlines)
			sandbox.show();
		showPotentialNode();
		showSeed();
	} 

	else if (creating_generator){
		if (withinBounds(mouseX, mouseY, screen_bounds) && noOpenWindows())
			refreshEdgeType();
		showSelection();
		edges_drawn = false;
	}

	else if (fractalize){
		advance();
		if (next_edge_count > 100){
			load_bar.setPercentage((edges.length - prev_edge_count) / (next_edge_count - prev_edge_count));
			load_bar.show();
		}
	}

	else if (!edges_drawn)
		refresh();

	if (mouseIsPressed && !creating_seed && !creating_generator && !fractalize){
		if (!dragging_cursor_control && noOpenWindows() && !zoom_mode && ready){
			if (withinBounds(mouseX, mouseY, screen_bounds) && !withinBounds(mouseX, mouseY, cursor_control.bounds))
				translateShape();
		}
	}

	control_box.show();

	showOpenWindows();

	if (!creating_seed && !creating_generator && !fractalize && !capturing_screen)
		cursor_control.show();

	show_upload_button ? upload_button.show() : upload_button.hide();
	show_text_input ? text_input.show() : text_input.hide();
	show_save_button ? save_button.show() : save_button.hide();
	show_screenshot_button ? screenshot_button.show() : screenshot_button.hide();
	show_drop_area ? drop_area.show() : drop_area.hide();

	if (dragging_cursor_control){
		if (!mouseIsPressed)
			dragging_cursor_control = false
		else
			translateCursorControl();
	}
	
	if (!mouseIsPressed)
		ready = true;

	// fill(255);
	// text(str(mouseX) + ", " + str(mouseY), 50, 50);
}


// =======================================================================================================
// ==MOUSE AND KEYBOARD EVENTS
// =======================================================================================================
function mousePressed(){
	if (mouseButton === LEFT){
		if (noOpenWindows()){
			// Store click location globally for drag functionality
			prev_click = [mouseX, mouseY];

			// Seed creation mouse events
			if (creating_seed && withinBounds(mouseX, mouseY, screen_bounds) && notDoubledUp())
				updateSeed();

			// Generator creation mouse events
			if (creating_generator && withinBounds(mouseX, mouseY, screen_bounds))
				updateGenerator(false, false);

			// Control box mouse events
			if (withinBounds(mouseX, mouseY, control_box.bounds) && !fractalize && ready){
				if (buttonClicked("SAVE"))
					toggleSaveDialog();

				else if (buttonClicked("LOAD"))
					toggleLoadDialog();

				else if (buttonClicked("GRID\nLINES"))
					toggleGridlines();

				else if (buttonClicked("RESTART")){
					setup();
					help = false;
				}

				else if (buttonClicked("CONTINUE")){
					if (nodes.length < 3)
						alert("Put down at least 3 nodes to lock your seed.")
					else if (nodes[0].pos.equals(nodes[nodes.length - 2].pos))
						alert("Your seed must start and end at different positions.")
					else
						setupForGenerator();
				}

				else if (buttonClicked("UNDO"))
					undo();

				else if (buttonClicked("SKIP\nEDGE"))
					updateGenerator(true, false);

				else if (buttonClicked("HIDE\nEDGE"))
					updateGenerator(false, true);

				else if (buttonClicked("HELP"))
					toggleHelpScreen();

				else if (buttonClicked("FRACTALIZE"))
					getReadyToFractalize();

				ready = false;
			}
		}

		// Sample seed open button mouse events
		if (loading_seed && withinBounds(mouseX, mouseY, file_browser.open_button_bounds))
			showSampleMenu();

		// Sample seed menu mouse events
		else if (withinBounds(mouseX, mouseY, file_browser.bounds) && loading_sample_seed){
			for (var i = 0; i < file_browser.files.length; i++){
				if (withinBounds(mouseX, mouseY, file_browser.files[i].bounds)){
					loading_sample_seed = false;
					loadStrings("samples/" + file_browser.files[i].name, loadSeed);
				}
			}
		}

		// Help menu scrolling button mouse events
		if (help){
			if (withinBounds(mouseX, mouseY, help_screen.scroll_button.left_bounds))
				help_screen.prevImage();
			if (withinBounds(mouseX, mouseY, help_screen.scroll_button.right_bounds))
				help_screen.nextImage();
		}

		// Cursor control (cursor mode / zoom mode) mouse events
		if (!creating_seed && !creating_generator && !fractalize){
			if (withinBounds(mouseX, mouseY, cursor_control.cursor_bounds))
				zoom_mode = false;
			if (withinBounds(mouseX, mouseY, cursor_control.zoom_bounds))
				zoom_mode = true;
		}

		// Check to see if cursor control is clicked within the drag area
		if (!dragging_cursor_control && withinBounds(mouseX, mouseY, cursor_control.drag_bounds))
			dragging_cursor_control = true;

		// Exit button mouse events
		if (withinBounds(mouseX, mouseY, exit_button.bounds)){
			closeOpenWindows();
			ready = false;
		}
	}

	// Zoom mouse events
	if (zoom_mode && withinBounds(mouseX, mouseY, screen_bounds) && !withinBounds(mouseX, mouseY, cursor_control.bounds))
		if (mouseButton === LEFT)
			zoom(1.2, [mouseX, mouseY]);
		else
			zoom(0.8, [mouseX, mouseY]);
}

function keyPressed(){
	if (noOpenWindows()){
		if (key == 'R'){
			setup();
			help = false;
		}

		if (key == 'G')
			toggleGridlines();

		if (keyCode == ENTER){
			if (creating_seed){
				if (nodes.length < 3)
					alert("Put down at least 3 nodes to lock your seed.")
				else if (nodes[0].pos.equals(nodes[nodes.length - 2].pos))
					alert("Your seed must start and end at different positions.")
				else
					setupForGenerator();
			}

			if (!creating_seed && !creating_generator && !fractalize)
				getReadyToFractalize();
		}

		if (key == 'Z' && (creating_seed || creating_generator))
			undo();

		if (key == 'S')
			toggleSaveDialog();

		if (key == 'L')
			toggleLoadDialog();

		if (key == 'H')
			toggleHelpScreen();
	}

	if (help){
		if (keyCode == LEFT_ARROW)
			help_screen.prevImage();
		if (keyCode == RIGHT_ARROW)
			help_screen.nextImage();
	}

	if (!noOpenWindows() && keyCode == ESCAPE)
		closeOpenWindows();

}

function mouseWheel(event){
	if (!mouseIsPressed && !creating_seed && !creating_generator && !fractalize)
		zoom(map(constrain(event.delta, -200, 200), -200, 200, 1.3, 0.7), [mouseX, mouseY]);
	return false;
}

function withinBounds(x, y, bounds){
	return (x >= bounds[0] && x < bounds[1] && y >= bounds[2] && y < bounds[3]);
	// 			left             right           bottom             top
}

function toggleHelpScreen(){
	help ? help = false : help = true;
	edges_drawn = false;
	exit_button.setPosition(sandbox.pos.x + 257, sandbox.pos.y - 195);
}

// =======================================================================================================
// ==ZOOM AND DRAG
// =======================================================================================================
function translateShape(){
	deltaX = mouseX - prev_click[0];
	deltaY = mouseY - prev_click[1];

	prev_click = [mouseX, mouseY];

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

function translateCursorControl(){
	if (mouseX > 2 && mouseY > 2 && mouseX < width - cursor_control.width - 2 && mouseY < screen_bounds[3] - cursor_control.height - 2){
		cursor_control.setPosition(mouseX, mouseY);
		cursor_control.resetBounds();
		edges_drawn = false;
	}
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
function showPotentialNode(){
	if (withinBounds(mouseX, mouseY, screen_bounds)){
		if (sandbox.type == 0 || sandbox.type == 1)
			nodes[nodes.length - 1].setPosition(closestGridPoint(mouseX, mouseY, sandbox.coords));
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
	if (withinBounds(mouseX, mouseY, screen_bounds) && !loading_seed){
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

function undo(){
	if (creating_seed && nodes.length > 1){
		nodes.splice(nodes.length-1, 1);
		edges.splice(nodes.length-1, 1);
	}

	if (creating_generator && idx < edges.length){
		if (edges[idx].type < 4){
			nodes.splice(idx + 1, seed_data.length - 1);
			edges.splice(idx, seed_data.length);
			edges = splice(edges, edges_copy[idx], idx);
			idx++;
		}
		else {
			edges.splice(idx, 1);
			edges = splice(edges, edges_copy[idx], idx);
			idx++;
		}
	}
}

function notDoubledUp(){
	if (nodes.length < 2)
		return true;
	return !(nodes[nodes.length - 2].pos.equals(nodes[nodes.length - 1].pos));
}

function toggleGridlines(){
	sandbox.setType((sandbox.type + 1) % 3);
	sandbox.type == 2 ? show_gridlines = false : show_gridlines = true;
	edges_drawn = false;
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

	showButtons(["SKIP\nEDGE", "HIDE\nEDGE", "UNDO", "LOAD", "RESTART", "HELP"]);

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

function showSelection(){
	var result = subdivide(idx);
	temp_nodes = result[0];
	temp_edges = result[1];

	for (var i = 0; i < idx - 1; i++)
		edges[i].show();

	for (var i = 0; i < temp_edges.length; i++)
		if (temp_edges[i].type < 5)
			temp_edges[i].show();

	for (var i = idx; i < edges.length; i++)
		if (edges[i].type < 5)
			edges[i].show();

	for (var i = 0; i < nodes_copy.length; i++)
		nodes_copy[i].show();
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
		scaleColours();
		creating_generator = false;
		showButtons(["FRACTALIZE", "SAVE", "LOAD", "COLOR\nSCHEME", "RESTART", "HELP"]);
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

// =======================================================================================================
// ==FRACTALIZATION
// =======================================================================================================
function getReadyToFractalize(){
	prev_edge_count = edges.length;

	var num_unreplaced = 0;
	for (var i = 0; i < edges.length; i++){
		if (edges[i].type > 3)
			num_unreplaced++;
	}

	next_edge_count = num_unreplaced + (edges.length - num_unreplaced) * seed_data.length;
	console.log(next_edge_count);
	if (next_edge_count <= 30000){
		current_edge = edges.length;
		fractalize = true;
		level++;
	}
	else {
		nodes = nodeCopy(nodes_copy);
		edges = edgeCopy(edges_copy);
		scaleColours();
		edges_drawn = false;
		level = 1;
	}	
}

function advance(){
	speed = min(100, max(1, floor(edges.length / 100)));
	for (var i = 0; i < speed; i++){
		if (edges[current_edge - 1].type < 4)
			update(current_edge);
		current_edge--;
		if (current_edge == 0){
			fractalize = false;
			break;
		}
	}

	scaleColours();
	for (var i = edges.length - 1; i >= 0; i--)
		if (edges[i].type != 5)
			edges[i].show();

	edges_drawn = false;
}

function update(e){
	var result = subdivide(e);
	temp_nodes = result[0];
	temp_edges = result[1];
	edges.splice(e - 1, 1);
	edges = splice(edges, temp_edges, e - 1);
	nodes = splice(nodes, temp_nodes, e);
}

function refresh(){
	background(51);
	for (var i =  edges.length - 1; i >= 0; i--)
		if (edges[i].type != 5)	
			edges[i].show();
	edges_drawn = true;
}

function scaleColours(){
	var l = edges.length;
	var r, g, b;
	for (var i = 0; i < l; i++){
		// Map position in edges array to value between 0 and 1
		x = map(i, 0, l-1, 0, 1);

		// Shifted gaussians map pixel channels
		r = 0.79788*Math.exp(-pow(1*(x - 1.0), 2)/0.5);
		r = map(r, 0, 1, 20, 255);

		g = 0.79788*Math.exp(-pow(2*(x - 0.5), 2)/0.5);
		g = map(g, 0, 1, 20, 255);
		
		b = 0.79788*Math.exp(-pow(1*(x - 0.0), 2)/0.5);
		b = map(b, 0, 1, 20, 255);

		edges[i].setStroke([r, g, b]);
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

function toggleLoadDialog(){
	show_upload_button ? show_upload_button = false : show_upload_button = true;
	show_drop_area ? show_drop_area = false : show_drop_area = true;
	loading_seed ? loading_seed = false : loading_seed = true;
	!loading_seed ? edges_drawn = false : null;
	delay = true;
	exit_button.setPosition(sandbox.pos.x + 110, sandbox.pos.y - 60);
}

function handleFile(file){
	loadSeed(split(file.data, '\n'));
}

function loadSeed(loaded_data){
	upload_button.remove();
	drop_area.remove();

	setup();
	creating_seed = false;
	edges_drawn = false;
	loading_seed = false;
	ready_to_load = false;
	nodes = [];

	var specs;
	for (var i = 0; i < loaded_data.length - 1; i++){
		specs = split(loaded_data[i], '%');
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
	scaleColours();
	showButtons(["FRACTALIZE", "SAVE", "LOAD", "COLOR\nSCHEME", "RESTART", "HELP"]);
	help = false;
}

function showLoadBox(){
	push();
		fill(200);
		stroke(0);
		strokeWeight(7);
		rectMode(CENTER);
		rect(sandbox.pos.x, sandbox.pos.y, 250, 150, 10);
		fill(0);
		noStroke();
		textAlign(CENTER, CENTER);
		textSize(16);
		text("or", sandbox.pos.x, sandbox.pos.y - 17);
		text("or", sandbox.pos.x, sandbox.pos.y + 25);
	pop();
}

function styleDropArea(){
	drop_area.style("border", "2px");
	drop_area.style("border-style", "dashed");
	drop_area.style("border-color", "#000000");
	drop_area.style("padding-left", "20px");
	drop_area.style("padding-right", "20px");
	drop_area.style("font-family", "Verdana");
}

function highlightDropArea(){
	drop_area.style("background-color", "#e2edff");
}

function unhighlightDropArea(){
	drop_area.style("background", "none");
}

function showSampleMenu(){
	loading_seed = false;
	loading_sample_seed = true;
	show_upload_button = false;
	show_drop_area = false;
	edges_drawn = false;
	exit_button.setPosition(sandbox.pos.x + 90, sandbox.pos.y - 140);
}

function loadSample(){
	loading_seed = false;
	loading_sample_seed = true;
	show_upload_button = false;
	show_drop_area = false;
}

// =======================================================================================================
// ==SAVING
// =======================================================================================================
function toggleSaveDialog(){
	show_text_input ? show_text_input = false : show_text_input = true;
	show_save_button ? show_save_button = false : show_save_button = true;
	show_screenshot_button ? show_screenshot_button = false : show_screenshot_button = true;
	saving_seed ? saving_seed = false : saving_seed = true;
	!saving_seed ? edges_drawn = false : null;
	exit_button.setPosition(sandbox.pos.x + 125, sandbox.pos.y - 45);
}

function updateSaveFileName(){
	save_file_name = this.value();
}

function saveSeed(){
	var save_data = [];
	for (var i = 0; i < nodes_copy.length; i++)
		if (i == 0)
			save_data = append(save_data, str(nodes_copy[i].pos.x) + "%" + str(nodes_copy[i].pos.y));
		else
			save_data = append(save_data, str(nodes_copy[i].pos.x) + "%" + str(nodes_copy[i].pos.y) + "%" + str(edges_copy[i-1].type));
	saveStrings(save_data, save_file_name);
	saving_seed = false;
	show_save_button = false;
	show_screenshot_button = false;
	show_text_input = false;
	edges_drawn = false;
	ready = false;
}

function showSaveBox(){
	push();
		fill(200);
		stroke(0);
		strokeWeight(7);
		rectMode(CENTER);
		rect(sandbox.pos.x, sandbox.pos.y, 280, 120, 10);
		fill(0);
		noStroke();
		textAlign(CENTER, CENTER);
		textSize(14);
		text("What would you like to call your file?", sandbox.pos.x, sandbox.pos.y - 37);
	pop();
}

function saveScreenshot(){
	saving_seed = false;
	show_text_input = false;
	show_save_button = false;
	show_screenshot_button = false;
	capturing_screen = true;
	edges_drawn = false;
	draw();
	capturing_screen = false;
	
	var screenshot = copyScreenToImage();
	screenshot.save();
}

function copyScreenToImage(){
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

// =======================================================================================================
// ==CONTROL BOX FUNCTIONS
// =======================================================================================================
function refreshControlBox(){
	var shown_labels = [];
	for (var i = 0; i < button_labels.length; i++){
		if (button_indices[i] >= 0){
			shown_labels = append(shown_labels, button_labels[i]);
			button_indices[i] = shown_labels.length - 1;
		}
	}
	control_box = new ControlBox(width / 2 - 2, height - 32, width-3, 60, shown_labels.length, shown_labels);
}

function getButtonIndex(label){
	return button_indices[button_labels.indexOf(label)];
}

function buttonClicked(label){
	if (getButtonIndex(label) == -1)
		return false
	return withinBounds(mouseX, mouseY, control_box.buttons[getButtonIndex(label)].bounds);
}

function showButtons(labels_to_show){
	var show;
	for (var i = 0; i < button_labels.length; i++){
		show = false;
		for (var j = 0; j < labels_to_show.length; j++) {
			if (button_labels[i] === labels_to_show[j]){
				button_indices[i] = 1;
				show = true;
			}
		}
		if (!show)
			button_indices[i] = -1;
	}
	refreshControlBox();
}

function showOpenWindows(){
	if (saving_seed){
		showSaveBox();
		exit_button.show();
	}

	if (loading_seed && !loading_sample_seed){
		showLoadBox();
		exit_button.show();
		file_browser.showOpenButton();
	}

	if (loading_sample_seed){
		file_browser.show();
		exit_button.show();
	}

	if (help){
		help_screen.show();
		exit_button.show();
	}
}

function closeOpenWindows(){
	if (saving_seed){
		show_text_input = false;
		show_save_button = false;
		show_screenshot_button = false;
		saving_seed = false;
	}

	if (loading_seed){
		show_upload_button = false;
		show_drop_area = false;
		loading_seed = false;
	}

	loading_sample_seed ? loading_sample_seed = false : null;

	help ? help = false : null;

	edges_drawn = false;
	ready = false;
}

function noOpenWindows(){
	return (!help && !saving_seed && !loading_seed && !loading_sample_seed);
}