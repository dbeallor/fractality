function SlideViewer(title, x, y, width, height, button_title, listener){
	this.pos = createVector(x, y);
	this.title = title;
	this.width = width;
	this.height = height;
	this.bounds = [this.pos.x - this.width / 2, this.pos.x + this.width / 2, this.pos.y - this.height/2, this.pos.y + this.height/2];
	this.window = new p5Window(this.title, this.pos.x, this.pos.y, this.width, this.height);
	this.fill = color(220);
	this.current_image = 0;
	this.images = [];
	var d = pixelDensity();
	this.graphics = createGraphics(this.width * d, (this.height - this.window.header_height * 2) * d);
	this.visible = false;
	this.left_bounds = [this.bounds[0], this.pos.x - this.width * (1.0/3), this.bounds[2] + this.window.header_height, this.bounds[3] - this.window.header_height];
	this.right_bounds = [this.pos.x + this.width * (1.0/3), this.bounds[1], this.bounds[2] + this.window.header_height, this.bounds[3] - this.window.header_height];
	this.rect_alpha = 110;
	this.window.addButton(button_title, this.pos.x, this.pos.y + this.height / 2 - this.window.header_height / 2, this.width * 0.05, this.window.header_height * 0.6, listener);
	this.window.buttons[0].setFill(255);

	this.show = function(){
		if (this.visible){
			this.window.show();
			push();
				// Refresh Graphics
				var d = pixelDensity();
				var y_dim = this.height - 2 * this.window.header_height;
				var x_dim = (this.images[this.current_image].width * y_dim) / this.images[this.current_image].height;
				this.graphics.background(this.window.accent);
				this.graphics.resetMatrix();
				this.graphics.translate(this.graphics.width / (2*d), this.graphics.height / (2*d));
				this.graphics.imageMode(CENTER);
				this.graphics.image(this.images[this.current_image], 0, 0, x_dim, y_dim);

				// Show Graphics
				resetMatrix();
				translate(this.pos.x, this.pos.y);
				imageMode(CENTER);
				image(this.graphics, 0, 0, this.graphics.width / d, this.graphics.height / d);

				// Black frame
				noFill();
				stroke(0);
				resetMatrix();
				translate(this.pos.x - this.width / 2, this.pos.y - this.height / 2 + this.window.header_height);
				rect(0, 0, this.graphics.width / d, this.graphics.height / d);

				if (this.leftMouseOver() && menu_bar.folderIsOpen() < 0)
					this.showLeftRect();
				if (this.rightMouseOver() && menu_bar.folderIsOpen() < 0)
					this.showRightRect();
			pop();
		}
	}

	this.setFill = function(f){
		this.fill = f;
	}

	this.nextImage = function(){
		this.current_image = (this.current_image + 1) % this.images.length;
	}

	this.prevImage = function(){
		this.current_image = this.current_image - 1;
		if (this.current_image < 0)
			this.current_image = this.images.length - 1;
	}

	this.open = function(){
		this.visible = true;
		this.window.open();
	}

	this.close = function(){
		this.visible = false;
		this.window.close();
	}

	this.onClick = function(){
		if (this.visible){
			if (this.window.onClick()){
				this.close();
				return true;
			}
			else if (this.leftMouseOver())
				this.prevImage();
			else if (this.rightMouseOver())
				this.nextImage();
		}
		return false;
	}

	this.leftMouseOver = function(){
		return this.window.withinBounds(mouseX, mouseY, this.left_bounds);
	}

	this.rightMouseOver = function(){
		return this.window.withinBounds(mouseX, mouseY, this.right_bounds);
	}

	this.showLeftRect = function(){
		push();
			resetMatrix();
			fill(0, this.rect_alpha);
			noStroke();
			rect(this.left_bounds[0], this.left_bounds[2], this.left_bounds[1] - this.left_bounds[0], this.left_bounds[3] - this.left_bounds[2]);
			fill(150, 255);
			var halfway_x = (this.left_bounds[0] + this.left_bounds[1]) / 2;
			var halfway_y = (this.left_bounds[2] + this.left_bounds[3]) / 2;
			triangle(halfway_x - 20, halfway_y, halfway_x + 20, halfway_y - 20, halfway_x + 20, halfway_y + 20);
		pop();
	}

	this.showRightRect = function(){
		push();
			resetMatrix();
			fill(0, this.rect_alpha);
			noStroke();
			rect(this.right_bounds[0], this.right_bounds[2], this.right_bounds[1] - this.right_bounds[0], this.right_bounds[3] - this.right_bounds[2]);
			fill(150, 255);
			var halfway_x = (this.right_bounds[0] + this.right_bounds[1]) / 2;
			var halfway_y = (this.right_bounds[2] + this.right_bounds[3]) / 2;
			triangle(halfway_x + 20, halfway_y, halfway_x - 20, halfway_y - 20, halfway_x - 20, halfway_y + 20);
		pop();
	}

	this.onKeyPress = function(){
		if (this.visible){
			if (keyCode == LEFT_ARROW)
				this.prevImage();
			if (keyCode == RIGHT_ARROW)
				this.nextImage();
			if (keyCode == ESCAPE)
				this.close();
		}
	}

	this.setPosition = function(x, y){
		var d = pixelDensity();
		var was_open = this.visible;
		this.pos.set(x, y);
		this.bounds = [this.pos.x - this.width / 2, this.pos.x + this.width / 2, this.pos.y - this.height/2, this.pos.y + this.height/2];
		this.window = new p5Window(this.title, this.pos.x, this.pos.y, this.width, this.height);
		this.window.addButton(button_title, this.pos.x, this.pos.y + this.height / 2 - this.window.header_height / 2, this.width * 0.05, this.window.header_height * 0.6, listener);
		this.graphics = createGraphics(this.width * d, (this.height - this.window.header_height * 2) * d);
		this.left_bounds = [this.bounds[0], this.pos.x - this.width * (1.0/3), this.bounds[2] + this.window.header_height, this.bounds[3] - this.window.header_height];
		this.right_bounds = [this.pos.x + this.width * (1.0/3), this.bounds[1], this.bounds[2] + this.window.header_height, this.bounds[3] - this.window.header_height];
		if (was_open)
			this.open();
	}

	this.resize = function(w, h){
		var d = pixelDensity();
		var was_open = this.visible;
		this.width = w;
		this.height = h;
		this.bounds = [this.pos.x - this.width / 2, this.pos.x + this.width / 2, this.pos.y - this.height/2, this.pos.y + this.height/2];
		this.window = new p5Window(this.title, this.pos.x, this.pos.y, this.width, this.height);
		this.window.addButton(button_title, this.pos.x, this.pos.y + this.height / 2 - this.window.header_height / 2, this.width * 0.05, this.window.header_height * 0.6, listener);
		this.graphics = createGraphics(this.width * d, (this.height - this.window.header_height * 2) * d);
		this.left_bounds = [this.bounds[0], this.pos.x - this.width * (1.0/3), this.bounds[2] + this.window.header_height, this.bounds[3] - this.window.header_height];
		this.right_bounds = [this.pos.x + this.width * (1.0/3), this.bounds[1], this.bounds[2] + this.window.header_height, this.bounds[3] - this.window.header_height];
		if (was_open)
			this.open();
	}
}