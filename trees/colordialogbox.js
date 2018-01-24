function ColorDialogBox(title, x, y, width, height){
	this.pos = createVector(x, y);
	this.title = title;
	this.width = width;
	this.height = height;
	this.visible = false;
	this.rSlider = createSlider(0.7, 1, 0.7, 0.001);
	this.gSlider = createSlider(0.7, 1, 0.85, 0.001);
	this.bSlider = createSlider(0.7, 1, 0.7, 0.001);

	this.initialize = function(){
		this.bounds = [this.pos.x - this.width / 2, this.pos.x + this.width / 2, this.pos.y - this.height / 2, this.pos.y + this.height / 2];
		this.window = new p5Window(this.title, this.pos.x, this.pos.y, this.width, this.height);
		this.rSlider.position(30, 30);
		this.gSlider.position(30, 60);
		this.bSlider.position(30, 90);
		this.hideSliders();
	}

	this.show = function(){
		if (this.visible){
			this.window.show();
			push();
				fill(0);
				noStroke();
				textFont("Arial");
				textAlign(LEFT, CENTER);
				text("Gradient: ", this.pos.x - 65, this.pos.y);
			pop();
		}
	}

	this.open = function(){
		this.window.open();
		this.visible = true;
		this.showSliders();
	}

	this.close = function(){
		if (this.visible){
			this.window.close();
			this.visible = false;
			this.hideSliders();
		}
	}

	this.showSliders = function(){
		this.rSlider.style('visibility', 'visible');
		this.gSlider.style('visibility', 'visible');
		this.bSlider.style('visibility', 'visible');
	}

	this.hideSliders = function(){
		this.rSlider.style('visibility', 'hidden');
		this.gSlider.style('visibility', 'hidden');
		this.bSlider.style('visibility', 'hidden');
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
		this.initialize();
		if (was_open)
			this.open();
	}
}