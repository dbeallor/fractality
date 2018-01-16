function ColorDialogBox(title, x, y, width, height){
	this.pos = createVector(x, y);
	this.title = title;
	this.width = width;
	this.height = height;
	this.bounds = [this.pos.x - this.width / 2, this.pos.x + this.width / 2, this.pos.y - this.height / 2, this.pos.y + this.height / 2];
	this.window = new p5Window(this.title, this.pos.x, this.pos.y, this.width, this.height);
	this.visible = false;
	this.color_pickers = [];

	this.initialize = function(){
		var colors = ["#333333", "#ff0018", "#00f5ff", "#ff2900"];

		// Background color picker
		this.color_pickers[0] = createInput();
		this.color_pickers[0].attribute('type', 'color');
		this.color_pickers[0].position(this.pos.x + 15, this.pos.y - 25);
		this.color_pickers[0].hide();
		this.color_pickers[0].value(colors[0]);

		// Gradient color pickers
		for (var i = 1; i < 4; i++){
			this.color_pickers[i] = createInput();
			this.color_pickers[i].attribute('type', 'color');
			this.color_pickers[i].position(this.pos.x - 30 + (i-1) * 45, this.pos.y + 5);
			this.color_pickers[i].hide();
			this.color_pickers[i].value(colors[i]);
		}
	}

	this.show = function(){
		if (this.visible){
			this.window.show();
			push();
				fill(0);
				noStroke();
				textFont("Arial");
				text("Background: ", this.pos.x - 60, this.pos.y - 10);
				text("Gradient: ", this.pos.x - 85, this.pos.y + 20);
			pop();
		}
	}

	this.open = function(){
		this.window.open();
		this.visible = true;
		this.showColorPickers();
	}

	this.close = function(){
		this.window.close();
		this.visible = false;
		this.hideColorPickers();
		fractal.scaleColors();
		fractal.refresh();
	}

	this.showColorPickers = function(){
		for (var i = 0; i < this.color_pickers.length; i++)
			this.color_pickers[i].show();
	}

	this.hideColorPickers = function(){
		for (var i = 0; i < this.color_pickers.length; i++)
			this.color_pickers[i].hide();
	}

	this.onClick = function(){
		if (this.visible){
			if (this.window.onClick()){
				this.close();
				return true;
			}
		}
		return false;
	}

	this.onKeyPress = function(){
		if (this.visible){
			if (keyCode == ESCAPE)
				this.close();
		}
	}

	this.setPosition = function(x, y){
		var was_open = this.visible;
		this.pos.set(x, y);
		this.bounds = [this.pos.x - this.width / 2, this.pos.x + this.width / 2, this.pos.y - this.height / 2, this.pos.y + this.height / 2];
		this.window = new p5Window(this.title, this.pos.x, this.pos.y, this.width, this.height);
		this.color_pickers[0].position(this.pos.x + 15, this.pos.y - 25);
		for (var i = 1; i < 4; i++)
			this.color_pickers[i].position(this.pos.x - 30 + (i-1) * 45, this.pos.y + 5);
		if (was_open)
			this.open();
	}
}