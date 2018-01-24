var axiom = "F";
var sentence = axiom;
var len;
var r = 255;
var g = 255;
var b = 255;

var writing = true;

var rule = {a: "F", b: "F["};

var rSlider, bSlider, gSlider;

var r_scale, g_scale, b_scale;

var menu_bar;
var graphic;

var windows;

var center;
var screen_bounds;

function setup() {
	createCanvas(windowWidth, windowHeight);
	
	len = windowHeight * (1/4);

	var d = pixelDensity();
	graphic = createGraphics(d * windowWidth, d * windowHeight);

	initializeMenuBar();

	screen_bounds = [0, windowWidth, menu_bar.height, windowHeight];
	center = [windowWidth / 2, windowHeight / 2 + menu_bar.height];

	initializeWindows();

	r_scale = windows[0].rSlider.value();
	g_scale = windows[0].gSlider.value();
	b_scale = windows[0].bSlider.value();

	turtle(rule.b);
}

function initializeWindows(){
	windows = [];

	var color_dialog = new ColorDialogBox("Customize Color Scheme", center[0], center[1], 200, 100);
	color_dialog.initialize();
	windows = append(windows, color_dialog);

	// var screenshot_dialog = new SaveDialogBox("Capture Screenshot...", center[0], center[1], 250, 80, ".jpg", saveScreenshot, updateSaveFileName);
	// screenshot_dialog.initialize();
	// windows = append(windows, screenshot_dialog);

	// var intro = new Intro();
	// intro.initialize();
	// intro.open();
	// windows = append(windows, intro);
}

function draw(){
	background(51);

	var d = pixelDensity();
	image(graphic, 0, 0, graphic.width / d, graphic.height / d);

	if (!noOpenWindows()){
		theaterMode();
		showWindows();
	}

	menu_bar.show();
}

function keyPressed(){
	menu_bar.onKeyPress();
	if (noOpenWindows())
		menu_bar.checkShortcuts();

	windowKeyEvents();

	if (writing){
		if (keyCode == UP_ARROW){
			rule.b += "F";
			turtle(rule.b + "F");
		}		
		if (keyCode == DOWN_ARROW){
			rule.b += "][";
			turtle(rule.b + "F");
		}
		if (keyCode == LEFT_ARROW){
			rule.b += "-";
			turtle(rule.b + "F");
		}
		if (keyCode == RIGHT_ARROW){
			rule.b += "+";
			turtle(rule.b + "F");
		}
		if (keyCode == ENTER){
			while (rule.b.charAt(rule.b.length-1) == "["){
				rule.b = rule.b.substring(0,rule.b.length-1);
			}
			var pushes = 0;
			for (var i=0; i<rule.b.length; i++){
				if (rule.b.charAt(i) == "[")
					pushes++;
				else if (rule.b.charAt(i) == "]")
					pushes--;
			}
			if(pushes>0){
				for (var i=0; i<pushes; i++)
					rule.b += "]";
			}
			writing = false;
			update();
		}
	}
	if (key == ' ' && !writing){
		update();
		var f_count = 0;
		for (var i=0; i<sentence.length; i++){
			if (sentence.charAt(i) == "F")
				f_count++;
		}
		if (f_count>=25000){
			sentence = axiom;
		}
	}
}

function mousePressed(){
	menu_bar.onClick();
	windowClickEvents();
}

function windowResized(){
	resizeCanvas(windowWidth, windowHeight);
	len = windowHeight * (1/4);
	var d = pixelDensity();
	graphic = createGraphics(d * windowWidth, d * windowHeight);
	menu_bar.resize(windowWidth);
	turtle(sentence);
}

function update() {
	var next = "";
	for (var i=0; i<sentence.length; i++){
		if (sentence.charAt(i) == rule.a){
			next += rule.b;
		}
		else {
			next += sentence.charAt(i);
		}
	}
	sentence = next;
	// console.log(sentence);
	turtle(sentence);
}

function turtle(str) {
	graphic.background(51);
	graphic.resetMatrix();
	graphic.translate(width/2, height);
	r_scale = windows[0].rSlider.value();
	g_scale = windows[0].gSlider.value();
	b_scale = windows[0].bSlider.value();
	var prev_len = [];
	var prev_r = [];
	var prev_g = [];
	var prev_b = [];
	for (var i=0; i<str.length; i++){
		if (i!=str.length-1){
			if (str.charAt(i) == "F"){
				graphic.stroke(r,g,b);
				graphic.line(0,0,0,-len);
				graphic.translate(0,-len);
				len*=0.75;
				r*=r_scale;
				g*=g_scale;
				b*=b_scale;
			}
			else if (str.charAt(i) == "+"){
				graphic.rotate(radians(15));
			}
			else if (str.charAt(i) == "-"){
				graphic.rotate(-radians(15));
			}
			else if (str.charAt(i) == "["){
				prev_len.push(len);
				prev_r.push(r);
				prev_g.push(g);
				prev_b.push(b);
				if (writing){
					graphic.push();
					graphic.stroke(200,200,0);
					graphic.strokeWeight(10);
					graphic.point(0,0);
					graphic.pop();
				}
				graphic.push();
			}
			else if (str.charAt(i) == "]"){
				len = prev_len.pop();
				r = prev_r.pop();
				g = prev_g.pop();
				b = prev_b.pop();
				graphic.pop();
			}
		}
		else if (writing){
			graphic.push();
			graphic.stroke(200,200,0);
			graphic.strokeWeight(3);
			graphic.line(0,0,0,-len);
			graphic.pop();
		}
	}
	len = windowHeight * (1/4);
	r = 255;
	g = 255;
	b = 255;
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
	menu_bar.addButton("Restart", "R", function(){
		writing = true;
		sentence = axiom;
		rule.b = "F[";
		turtle(rule.b);
	});
	menu_bar.addButton("Capture Screenshot", "D", null);

	menu_bar.addFolder("Edit");
	menu_bar.addButton("Undo", "Z", null);

	menu_bar.addFolder("View");
	menu_bar.addButton("Resolution: Fastest", "1", null);
	menu_bar.checkButton("Resolution: Fastest");
	menu_bar.addButton("Resolution: Balance", "2", null);
	menu_bar.addButton("Resolution: Clearest", "3", null);
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