function Tutorial(){
	this.windows = [];
	this.current_window = 0;
	this.visible = false;

	this.show = function(){
		this.windows[this.current_window].show();
		if (this.current_window == 2){
			menu_bar.enableButtons(["Toggle Gridlines"]);
			menu_bar.openFolder(3);
			menu_bar.disable();
			if (grid.type == 1){
				menu_bar.enable();
				menu_bar.folders[3].buttons[2].unhighlight();
				menu_bar.closeFolder(3);
				this.nextWindow();
			}
		}
		else if (this.current_window == 3){
			this.showSeedTracer();
			menu_bar.enableButtons(["Undo"]);
			fractal.show();
			if (this.tracingSeedComplete()){
				lockSeed();
				this.nextWindow();
			}
		}
		else if (this.current_window == 4){
			menu_bar.enableButtons([]);
			if (fractal.creating_frame)
				this.nextWindow();
		}
		else if (this.current_window == 5){
			this.showFrameTracer();
			menu_bar.enableButtons(["Undo"]);
			fractal.show();
			if (this.tracingFrameComplete()){
				lockFrame();
				this.nextWindow();
			}
		}
		else if (this.current_window == 6){
			menu_bar.enableButtons([]);
			if (!fractal.orienting_frame)
				this.nextWindow();
		}
		else if (this.current_window == 7){
			menu_bar.enableButtons(["Grow"]);
			menu_bar.openFolder(4);
			menu_bar.disable();
			if (fractal.level == 2){
				menu_bar.enable();
				menu_bar.folders[4].buttons[2].unhighlight();
				menu_bar.closeFolder(4);
				this.nextWindow();
			}
		}
	}

	this.open = function(){
		this.current_window = 0;
		this.windows[this.current_window].open();
		this.visible = true;
	}

	this.close = function(){
		this.windows[this.current_window].close();
		this.visible = false;
	}

	this.idle = function(){
		return (!this.visible || (this.current_window >= 3 && this.current_window <= 5));
	}

	this.addWindow = function(title, x, y, w, h){
		this.windows = append(this.windows, new p5Window(title, x, y, w, h));
	}

	this.addText = function(t){
		this.steps[this.steps.length - 1].setText(t);
	}

	this.addButton = function(label, x, y, w, h, listener){
		this.steps[this.steps.length - 1].addButton(label, x, y, w, h, listener);
	}

	this.addAction = function(listener){
		this.steps = append(this.steps, listener);
		this.step_types = append(this.step_types, 1);
	}

	this.initialize = function(){
		this.addWindow("Tutorial", grid.pos.x, grid.pos.y, 310, 200);
		this.windows[0].exitable = false;
		this.windows[0].setTextStyle(NORMAL);
		this.windows[0].setTextSize(14);
		this.windows[0].setTextPosition(0, -25);
		this.windows[0].setText("Welcome to Fractality!\n\nLet's run through an example of a\nfundamental fractal, The Koch Snowflake.");
		this.windows[0].addButton("Continue", grid.pos.x, grid.pos.y + 42, 70, 30, nextWindow);

		this.addWindow("Fractal Seeds", grid.pos.x, grid.pos.y, 400, 350);
		this.windows[1].exitable = false;
		this.windows[1].setTextStyle(NORMAL);
		this.windows[1].setTextSize(14);
		this.windows[1].setTextPosition(0, -20);
		this.windows[1].setText('First, let\'s go over a few basic concepts:\n\n' + 
								'The \"seed\" is a shape that is used to generate the fractal\nvia a process called "growing".\n\n' +
								'"Growing" the seed is the process of repeatedly replacing\nthe lines that makes up the seed with smaller copies\nof the entire seed.\n\n' +
								'The \"frame\" is another shape used to generate the fractal.\nThis is accomplised by planting a seed on each of the lines\nthat make up the frame, ' +
									'and allowing the seeds to grow.\n'
		);
		this.windows[1].addButton("Continue", grid.pos.x, grid.pos.y + 112, 70, 30, nextWindow);

		this.addWindow("Gridlines", menu_bar.folders[3].buttons[0].bounds[1] + 20 + 200, screen_bounds[2] + 20 + 55, 400, 110);
		this.windows[2].exitable = false;
		this.windows[2].setTextStyle(NORMAL);
		this.windows[2].setTextSize(14);
		this.windows[2].setTextPosition(0, 0);
		this.windows[2].setText("To draw the seed for the Koch Snowflake, first let's\nchange the gridlines so we have a triangle grid displayed.");

		this.addWindow("Creating the Seed", screen_bounds[1] - 115 - 20, screen_bounds[2] + 20 + 60, 230, 120);
		this.windows[3].exitable = false;
		this.windows[3].setTextStyle(NORMAL);
		this.windows[3].setTextSize(14);
		this.windows[3].setTextPosition(0, 0);
		this.windows[3].setText("Trace out the seed below!\nTip: If you make a mistake, use the\nundo button in the edit menu.");

		this.addWindow("Orienting the Seed", screen_bounds[0] + 125 + 20, screen_bounds[2] + 20 + 105, 250, 210);
		this.windows[4].exitable = false;
		this.windows[4].setTextStyle(NORMAL);
		this.windows[4].setTextSize(14);
		this.windows[4].setTextPosition(0, 0);
		this.windows[4].setText("Now that you have created your\nseed, you must provide the rules\nthat guide the growing process.\n\n"+
								"Using your mouse, click above each\nline to orient the replacement\ncopies of the seed upwards.");

		this.addWindow("Creating the Frame", grid.pos.x + 120 + 200, screen_bounds[2] + 20 + 45, 240, 90);
		this.windows[5].exitable = false;
		this.windows[5].setTextStyle(NORMAL);
		this.windows[5].setTextSize(14);
		this.windows[5].setTextPosition(0, 0);
		this.windows[5].setText("Trace out the frame below!");

		this.addWindow("Orienting the Frame", screen_bounds[0] + 125 + 20, screen_bounds[2] + 20 + 70, 250, 140);
		this.windows[6].exitable = false;
		this.windows[6].setTextStyle(NORMAL);
		this.windows[6].setTextSize(14);
		this.windows[6].setTextPosition(0, 0);
		this.windows[6].setText("Finally, using your mouse, plant\nthe seeds pointing outwardly by\nclicking outside each of the lines\nthat make up the frame.");

		this.addWindow("Growing the Seeds", grid.pos.x + 130 + 150, screen_bounds[2] + 20 + 65, 300, 130);
		this.windows[7].exitable = false;
		this.windows[7].setTextStyle(NORMAL);
		this.windows[7].setTextSize(14);
		this.windows[7].setTextPosition(0, 0);
		this.windows[7].setText("You're now done all the necessary work to\nbegin growing the seeds! Click the grow\nbutton in the fractalization menu (or hit enter)\n"+
								"to grow your fractal.");

		this.addWindow("Exploring the Fractal", screen_bounds[1] - 120 - 20, screen_bounds[2] + 20 + 115, 240, 230);
		this.windows[8].exitable = false;
		this.windows[8].setTextStyle(NORMAL);
		this.windows[8].setTextSize(14);
		this.windows[8].setTextPosition(0, -20);
		this.windows[8].setText("Feel free to explore the fractal by\ngrowing it further, dragging it around\nwith your mouse, and zooming\nin / out with the mousewheel.\n\n"+
								"This completes the tutorial!");
		this.windows[8].addButton("Done", screen_bounds[1] - 120 - 20, screen_bounds[2] + 90 + 100, 70, 30, doneTutorial);
	}


	this.nextWindow = function(){
		this.windows[this.current_window].close();
		this.current_window = (this.current_window + 1) % this.windows.length;
		this.windows[this.current_window].open();
	}

	this.onClick = function(){
		this.windows[this.current_window].onClick();
		if (this.current_window == 2){

		}
	}

	this.showSeedTracer = function(){
		var node_coords = [grid.coords[60][20], grid.coords[60][40], grid.coords[40][50], grid.coords[60][60], grid.coords[60][80]];
		push();
			for (var i = node_coords.length - 1; i >= 0; i--){
				fill(255, 100);
				noStroke();
				ellipse(node_coords[i][0], node_coords[i][1], 20);
				fill(255, 0, 0);
				ellipse(node_coords[i][0], node_coords[i][1], 7);
				fill(255);
				textSize(16);
				textAlign(CENTER, CENTER);
				textStyle(BOLD);
				var printed = false;
				if (this.tracingSeedComplete(i) && i + 1 == fractal.nodes.length && !printed){
					text(str(i+1), (i == 2) ? node_coords[i][0] - 17 : node_coords[i][0], (i == 2) ? node_coords[i][1] - 17 : node_coords[i][1] + 25);
					printed = true;
				}
				if (fractal.nodes.length >= i + 1 && !this.tracingSeedComplete(i) && this.tracingSeedComplete(i-1)){
					text(str(i), (i - 1 == 2) ? node_coords[i - 1][0] - 17 : node_coords[i - 1][0], (i - 1 == 2) ? node_coords[i-1][1] - 17 : node_coords[i-1][1] + 25);
				}
			}
		pop();
	}

	this.nodeOnPos = function(node, pos){
		return (node.pos.x == pos[0] && node.pos.y == pos[1]);
	}

	this.tracingSeedComplete = function(n){
		var node_coords = [grid.coords[60][20], grid.coords[60][40], grid.coords[40][50], grid.coords[60][60], grid.coords[60][80]];
		if (typeof(n) == 'undefined' && fractal.nodes.length <= 4)
			return false;
		else if (n == 0)
			return true;
		else
			for (var i = 0; i < (n || node_coords.length); i++){
				if (fractal.nodes.length <= i + 1)
					return false;
				if (fractal.nodes.length > i && !this.nodeOnPos(fractal.nodes[i], node_coords[i]))
					return false;
			}
		return true;
	}

	this.showFrameTracer = function(){
		var node_coords = [grid.coords[70][50], grid.coords[40][35], grid.coords[40][65], grid.coords[70][50]];
		push();
			for (var i = 0; i < node_coords.length; i++){
				fill(255, 100);
				noStroke();
				ellipse(node_coords[i][0], node_coords[i][1], 20);
				fill(255, 0, 0);
				ellipse(node_coords[i][0], node_coords[i][1], 7);
				fill(255);
				textSize(16);
				textAlign(CENTER, CENTER);
				textStyle(BOLD);
				if (this.tracingFrameComplete(i) && i + 1 == fractal.nodes.length)
					text(str(i+1), (i == 0 || i == 3) ? node_coords[i][0] - 17 : node_coords[i][0], (i == 0 || i == 3) ? node_coords[i][1] + 17 : node_coords[i][1] + 25);
			}
		pop();
	}

	this.tracingFrameComplete = function(n){
		var node_coords = [grid.coords[70][50], grid.coords[40][35], grid.coords[40][65], grid.coords[70][50]];
		if (typeof(n) == 'undefined' && fractal.nodes.length <= 3)
			return false;
		else if (n == 0)
			return true;
		else
			for (var i = 0; i < (n || node_coords.length); i++){
				if (fractal.nodes.length <= i + 1)
					return false;
				if (fractal.nodes.length > i && !this.nodeOnPos(fractal.nodes[i], node_coords[i]))
					return false;
			}
		return true;
	}
}