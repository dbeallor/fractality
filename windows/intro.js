function Intro(){
	this.pos = createVector(grid.pos.x, grid.pos.y);
	this.title = "Welcome";
	this.button_gap = 130;
	this.button_offsetX = 193;
	this.button_labels = ["Show Me Around", "Sample Gallery", "New Fractal", "Open Fractal"];
	this.button_height = 40;
	this.button_width = -1;
	var len;
	for (var i = 0; i < this.button_labels.length; i++){
		len = pow(str(this.button_labels[i]).length, 1/1.5) * 18 + 10;
		if (len > this.button_width)
			this.button_width = len;
	}
	this.visible = false;

	this.initialize = function(){
		this.height = windowHeight * 0.9;
		this.width = constrain(this.height * 1.6, 0, windowWidth * 0.9);
		this.bounds = [this.pos.x - this.width / 2, this.pos.x + this.width / 2, this.pos.y - this.height / 2, this.pos.y + this.height / 2];
		this.window = new p5Window(this.title, this.pos.x, this.pos.y, this.width, this.height);
		this.button_offsetY = this.height * 0.03 + 10;
		this.window.addButton(this.button_labels[0], this.pos.x - this.button_offsetX                          , this.pos.y + this.button_offsetY, this.button_width, this.button_height, startTutorial);
		this.window.addButton(this.button_labels[1], this.pos.x - this.button_offsetX +     this.button_gap, this.pos.y + this.button_offsetY, this.button_width, this.button_height, openGallery);
		this.window.addButton(this.button_labels[2], this.pos.x - this.button_offsetX + 2 * this.button_gap, this.pos.y + this.button_offsetY, this.button_width, this.button_height, closeWindows);
		this.window.addButton(this.button_labels[3], this.pos.x - this.button_offsetX + 3 * this.button_gap, this.pos.y + this.button_offsetY, this.button_width, this.button_height, openLoadDialog);
		this.window.exitable = false;

		var d = pixelDensity();
		this.graphics = createGraphics(this.width * d, (this.height - this.window.header_height * 2) * d);
	}

	this.show = function(){
		this.window.show();
		if (this.visible){
			push();
				var d = pixelDensity();
				var y_dim = this.height - 2 * this.window.header_height;
				var x_dim = (intro_image.width * y_dim) / intro_image.height;
				this.graphics.background(this.window.accent);
				this.graphics.resetMatrix();
				this.graphics.translate(this.graphics.width / (2*d), this.graphics.height / (2*d));
				this.graphics.imageMode(CENTER);
				this.graphics.image(intro_image, 0, 0, x_dim, y_dim);

				resetMatrix();
				translate(this.pos.x, this.pos.y);
				imageMode(CENTER);
				image(this.graphics, 0, 0, this.graphics.width / d, this.graphics.height / d);

				noFill();
				stroke(0);
				resetMatrix();
				translate(this.pos.x - this.width / 2, this.pos.y - this.height / 2 + this.window.header_height);
				rect(0, 0, this.graphics.width / d, this.graphics.height / d);
			pop();
		}
		this.window.showButtons();
	}

	this.open = function(){
		this.window.open();
		this.visible = true;
	}

	this.close = function(){
		this.window.close();
		this.visible = false;
	}

	this.setPosition = function(x, y){
		this.pos.set(x, y);
		this.initialize();
		if (this.visible)
			this.open();
	}

	this.resize = function(w, h){
		this.initialize();
		if (this.visible)
			this.open();
	}

	this.onKeyPress = function(){
		if (this.visible){
			if (keyCode == ESCAPE)
				this.close();
		}
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
}