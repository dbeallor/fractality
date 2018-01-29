function Intro(){
	this.pos = createVector(center[0], center[1]);
	this.title = "Welcome";
	this.button_gap = 130;
	this.button_offsetX = 66;
	this.button_labels = ["Show Me Around", "Jump Right In"];
	this.button_height = 40;
	this.button_width = -1;
	this.image;
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
		this.button_offsetY = this.height * 0.03 - 30;
		this.window.addButton(this.button_labels[0], this.pos.x - this.button_offsetX                          , this.pos.y + this.button_offsetY, this.button_width, this.button_height, startTutorial);
		this.window.addButton(this.button_labels[1], this.pos.x - this.button_offsetX +     this.button_gap, this.pos.y + this.button_offsetY, this.button_width, this.button_height, closeWindows);
		this.window.exitable = false;
		var ratio = ad.width / ad.height;
		var h = this.height * 0.2;
		var w = h * ratio;
		var x = this.pos.x;
		var y = this.pos.y + (this.height - this.window.header_height) / 5;
		this.ad_bounds = [x - w / 2, x + w / 2, y - h / 2, y + h / 2];

		var d = pixelDensity();
		this.graphics = createGraphics(this.width * d, (this.height - this.window.header_height * 2) * d);
	}

	this.show = function(){
		this.window.show();
		if (this.visible){
			push();
				textFont("Arial");
				var d = pixelDensity();
				var y_dim = this.height - 2 * this.window.header_height;
				var x_dim = (this.image.width * y_dim) / this.image.height;
				this.graphics.background(this.window.accent);
				this.graphics.resetMatrix();
				this.graphics.translate(this.graphics.width / (2*d), this.graphics.height / (2*d));
				this.graphics.imageMode(CENTER);
				this.graphics.image(this.image, 0, 0, x_dim, y_dim);

				resetMatrix();
				translate(this.pos.x, this.pos.y);
				imageMode(CENTER);
				image(this.graphics, 0, 0, this.graphics.width / d, this.graphics.height / d);

				noFill();
				stroke(0);
				resetMatrix();
				translate(this.pos.x - this.width / 2, this.pos.y - this.height / 2 + this.window.header_height);
				rect(0, 0, this.graphics.width / d, this.graphics.height / d);

				fill(255);
				textSize(48);
				noStroke();
				resetMatrix();
				textAlign(CENTER, CENTER);
				textStyle(BOLD);
				var x = this.pos.x;
				var y = this.pos.y + this.button_offsetY - 60;
				text("Fractality Mandelbrot", x, y);
				textSize(24);
				text("Beta", x + 270, y - 20);

				this.showAd();
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
			else if (withinBounds(mouseX, mouseY, this.ad_bounds))
				window.location.href = 'http://fractality.me';
		}
		return false;
	}

	this.showAd = function(){
		var ratio = ad.width / ad.height;
		var h = this.height * 0.2;
		var w = h * ratio;
		var x = this.pos.x;
		var y = this.pos.y + (this.height - this.window.header_height) / 5;
		push();
		fill(220);
		rectMode(CENTER);
		rect(x, y, w + 10, h + 10, 4);
		imageMode(CENTER);
		image(ad, x, y, w, h);
		pop();
	}
}