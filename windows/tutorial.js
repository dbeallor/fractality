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
			if (this.tracingComplete()){
				lockSeed();
				this.nextWindow();
			}
		}
		else if (this.current_window == 4){
			menu_bar.enableButtons([]);
			if (fractal.edges.length > 5)
				this.nextWindow();
		}
		else if (this.current_window == 5){
			menu_bar.enableButtons(["Skip Edge"]);
			menu_bar.openFolder(2);
			menu_bar.disable();
			if (fractal.seed.edges[3].type == 4){
				menu_bar.enable();
				menu_bar.closeFolder(2);
				this.nextWindow();
			}
		}
		else if (this.current_window == 6){
			menu_bar.enableButtons(["Skip Edge"]);
			if (!fractal.creating_generator)
				this.nextWindow();
		}
		else if (this.current_window == 8){
			menu_bar.enableButtons(["Level Up"]);
			menu_bar.openFolder(4);
			menu_bar.disable();
			if (fractal.level == 2){
				menu_bar.enable();
				menu_bar.folders[4].buttons[1].unhighlight();
				menu_bar.closeFolder(4);
				this.nextWindow();
			}
		}
		else if (this.current_window == 9)
			refreshMenuBarButtons();

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
		this.windows[0].setText("Welcome to Fractality!\n\nLet's run through an example of a\nfundamental fractal... The Sierpinski Triangle");
		this.windows[0].addButton("Continue", grid.pos.x, grid.pos.y + 42, 70, 30, nextWindow);

		this.addWindow("Fractal Seeds", grid.pos.x, grid.pos.y, 400, 190);
		this.windows[1].exitable = false;
		this.windows[1].setTextStyle(NORMAL);
		this.windows[1].setTextSize(14);
		this.windows[1].setTextPosition(0, -20);
		this.windows[1].setText('The \"seed\" is the shape that is used to generate the final\nfractal. This is accomplished by replacing each line in\nthe seed by a copy of the entire seed.');
		this.windows[1].addButton("Continue", grid.pos.x, grid.pos.y + 32, 70, 30, nextWindow);

		this.addWindow("Gridlines", menu_bar.folders[3].buttons[0].bounds[1] + 20 + 200, screen_bounds[2] + 20 + 55, 400, 110);
		this.windows[2].exitable = false;
		this.windows[2].setTextStyle(NORMAL);
		this.windows[2].setTextSize(14);
		this.windows[2].setTextPosition(0, 0);
		this.windows[2].setText("To draw the seed for the Sierpinski Triangle, first let's\nchange the gridlines so we have a triangle grid displayed.");

		this.addWindow("Drawing the Seed", screen_bounds[1] - 115 - 20, screen_bounds[2] + 20 + 60, 230, 120);
		this.windows[3].exitable = false;
		this.windows[3].setTextStyle(NORMAL);
		this.windows[3].setTextSize(14);
		this.windows[3].setTextPosition(0, 0);
		this.windows[3].setText("Trace out the seed below!\nTip: If you make a mistake, use the\nundo button in the edit menu.");

		this.addWindow("Orienting the Seed", screen_bounds[0] + 120 + 20, screen_bounds[2] + 20 + 125, 240, 250);
		this.windows[4].exitable = false;
		this.windows[4].setTextStyle(NORMAL);
		this.windows[4].setTextSize(14);
		this.windows[4].setTextPosition(0, 0);
		this.windows[4].setText("Now that you have drawn your\nseed, for each line you must\nchoose the direction in which the\ncopy of the seed will be oriented.\n\n"
							  + "The larger nodes indicate which\nedge is currently being oriented.\nClick above the first line to orient\nthe first copy of the seed upwards.");

		this.addWindow("Skipping and Hiding Edges", menu_bar.folders[2].buttons[0].bounds[1] + 15 + 280, screen_bounds[2] + 15 + 70, 560, 140);
		this.windows[5].exitable = false;
		this.windows[5].setTextStyle(NORMAL);
		this.windows[5].setTextSize(14);
		this.windows[5].setTextPosition(0, 0);
		this.windows[5].setText("Skip the next edge, meaning this edge - and all copies of itself - will go unreplaced\nthroughout the fractalization process.\n\n"
			                   +"Note that you can also hide an edge, which both skips the edge and hides it.\nThis is useful for creating seeds that cannot be drawn in one continuous line.");

		this.addWindow("Orienting the Seed", screen_bounds[1] - 120 - 20, screen_bounds[2] + 20 + 60, 240, 120);
		this.windows[6].exitable = false;
		this.windows[6].setTextStyle(NORMAL);
		this.windows[6].setTextSize(14);
		this.windows[6].setTextPosition(0, 0);
		this.windows[6].setText("The three remaining edges should\nbe oriented upwards, then skipped,\nthen oriented upwards again.");

		this.addWindow("Fractalizing", grid.pos.x, screen_bounds[2] + 40 + 70, 260, 140);
		this.windows[7].exitable = false;
		this.windows[7].setTextStyle(NORMAL);
		this.windows[7].setTextSize(14);
		this.windows[7].setTextPosition(0, -20);
		this.windows[7].setText("You are now done creating the seed!\nLet's begin the fractalization process.");
		this.windows[7].addButton("Continue", grid.pos.x, screen_bounds[2] + 53 + 80, 70, 30, nextWindow);

		this.addWindow("Levelling Up", menu_bar.folders[4].buttons[0].bounds[1] + 20 + 150, screen_bounds[2] + 20 + 55, 300, 110);
		this.windows[8].exitable = false;
		this.windows[8].setTextStyle(NORMAL);
		this.windows[8].setTextSize(14);
		this.windows[8].setTextPosition(0, 0);
		this.windows[8].setText("Use the level up button (or hit enter) to go\none level deeper into the fractal.")

		this.addWindow("Exploring the Fractal", screen_bounds[1] - 120 - 20, screen_bounds[2] + 20 + 115, 240, 230);
		this.windows[9].exitable = false;
		this.windows[9].setTextStyle(NORMAL);
		this.windows[9].setTextSize(14);
		this.windows[9].setTextPosition(0, -20);
		this.windows[9].setText("Feel free to explore the fractal by\nlevelling up, dragging it around with\nyour mouse, and zooming in / out\nwith the mousewheel.\n\n"+
								"This completes the tutorial!");
		this.windows[9].addButton("Done", screen_bounds[1] - 120 - 20, screen_bounds[2] + 90 + 100, 70, 30, doneTutorial);
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
		push();
			fill(255, 100);
			noStroke();
			ellipse(grid.coords[70][30][0], grid.coords[70][30][1], 20);
			ellipse(grid.coords[50][40][0], grid.coords[50][40][1], 20);
			ellipse(grid.coords[50][60][0], grid.coords[50][60][1], 20);
			ellipse(grid.coords[70][50][0], grid.coords[70][50][1], 20);
			ellipse(grid.coords[70][70][0], grid.coords[70][70][1], 20);
			fill(255, 0, 0);
			ellipse(grid.coords[70][30][0], grid.coords[70][30][1], 7);
			ellipse(grid.coords[50][40][0], grid.coords[50][40][1], 7);
			ellipse(grid.coords[50][60][0], grid.coords[50][60][1], 7);
			ellipse(grid.coords[70][50][0], grid.coords[70][50][1], 7);
			ellipse(grid.coords[70][70][0], grid.coords[70][70][1], 7);
			fill(255);
			textAlign(CENTER, CENTER);
			textStyle(BOLD);
			text("1", grid.coords[70][30][0] - 8, grid.coords[70][30][1] + 20, 20);
			text("3", grid.coords[50][40][0] - 8, grid.coords[50][40][1] - 20, 20);
			text("4", grid.coords[50][60][0] - 8, grid.coords[50][60][1] - 20, 20);
			text("6", grid.coords[70][70][0] - 8, grid.coords[70][70][1] + 20, 20);
			if (fractal.nodes.length > 2 && this.nodeOnPos(fractal.nodes[1], grid.coords[70][50][0], grid.coords[70][50][1]))
				text("5", grid.coords[70][50][0], grid.coords[70][50][1] + 20);
			else
				text("2", grid.coords[70][50][0], grid.coords[70][50][1] + 20);
		pop();
	}

	this.nodeOnPos = function(node, x, y){
		return (node.pos.x == x && node.pos.y == y);
	}

	this.tracingComplete = function(){
		if (fractal.nodes.length <= 6)
			return false;
		return (
			this.nodeOnPos(fractal.nodes[0], grid.coords[70][30][0], grid.coords[70][30][1])
		 && this.nodeOnPos(fractal.nodes[1], grid.coords[70][50][0], grid.coords[70][50][1])
		 && this.nodeOnPos(fractal.nodes[2], grid.coords[50][40][0], grid.coords[50][40][1])
		 && this.nodeOnPos(fractal.nodes[3], grid.coords[50][60][0], grid.coords[50][60][1])
		 && this.nodeOnPos(fractal.nodes[4], grid.coords[70][50][0], grid.coords[70][50][1])
		 && this.nodeOnPos(fractal.nodes[5], grid.coords[70][70][0], grid.coords[70][70][1])	
		);
	}
}