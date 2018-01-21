function Tutorial(){
	this.windows = [];
	this.current_window = 0;
	this.visible = false;

	this.show = function(){
		if (this.visible){
			this.windows[this.current_window].show();
			if (this.current_window == 1){
				menu_bar.enableButtons(["Undo"]);
				menu_bar.openFolder(2);
				menu_bar.disable();
			}
			if (this.current_window == 2){
				menu_bar.enableButtons(["Resolution: Clearest"]);
				menu_bar.openFolder(3);
				menu_bar.disable();
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
		this.addWindow("Welcome to the Fractality Mandelbrot Lab!", graphic_bounds[0] + 135 + 10, graphic_bounds[2] + 50 + 10, 270, 100);
		this.windows[0].exitable = false;
		this.windows[0].setTextStyle(NORMAL);
		this.windows[0].setTextSize(14);
		this.windows[0].setTextPosition(0, 0);
		this.windows[0].setText("Click and drag out a rectangle\nto zoom in on the Mandelbrot Set!");

		this.addWindow("Backing Up", menu_bar.folders[2].buttons[0].bounds[1] + 20 + 150, screen_bounds[2] + 20 + 45, 300, 90);
		this.windows[1].exitable = false;
		this.windows[1].setTextStyle(NORMAL);
		this.windows[1].setTextSize(14);
		this.windows[1].setTextPosition(0, 0);
		this.windows[1].setText("To zoom back out to the previous level,\nclick undo (or hit z).");

		this.addWindow("View Menu", menu_bar.folders[3].buttons[0].bounds[1] + 20 + 190, screen_bounds[2] + 20 + 90, 380, 180);
		this.windows[2].exitable = false;
		this.windows[2].setTextStyle(NORMAL);
		this.windows[2].setTextSize(14);
		this.windows[2].setTextPosition(0, 0);
		this.windows[2].setText("The View menu lets you choose the resolution of the\nimage, as well as customize the color scheme.\n\n" +
			"Click and choose the clearest resolution and observe\nthe results. The image looks much sharper, but the\nrendering time slows down.");

		this.addWindow("Explore", graphic_bounds[0] + 125 + 10, graphic_bounds[2] + 90 + 10, 250, 180);
		this.windows[3].exitable = false;
		this.windows[3].setTextStyle(NORMAL);
		this.windows[3].setTextSize(14);
		this.windows[3].setTextPosition(0, -25);
		this.windows[3].setText("And that's all there is to it! What can\nyou find in the infinitely unexplored\ndepths of the Mandelbrot Set?");
		this.windows[3].addButton("Done", graphic_bounds[0] + 125 + 10, graphic_bounds[2] + 90 + 40, 70, 30, doneTutorial);
	}

	this.nextWindow = function(){
		this.windows[this.current_window].close();
		this.current_window = (this.current_window + 1) % this.windows.length;
		this.windows[this.current_window].open();
	}

	this.onClick = function(){
		this.windows[this.current_window].onClick();
	}

	this.idle = function(){
		return (this.visible && this.current_window == 1)
	}
}