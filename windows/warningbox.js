function WarningBox(x, y, width, height, message, continue_listener, cancel_listener){
	this.pos = createVector(x, y);
	this.width = width;
	this.height = height;
	this.message = message;
	this.bounds = [this.pos.x - this.width / 2, this.pos.x + this.width / 2, this.pos.y - this.height / 2, this.pos.y + this.height / 2];
	this.window = new p5Window("Warning!", this.pos.x, this.pos.y, this.width, this.height);
	this.window.addButton("Continue", this.pos.x + 45, this.pos.y + 20, 70, 20, continue_listener);
	this.window.addButton("Cancel", this.pos.x - 45, this.pos.y + 20, 70, 20, cancel_listener);
	this.visible = false;

	this.show = function(){
		this.window.show();
		if (this.visible){
			push();
				resetMatrix();
				translate(this.pos.x, this.pos.y);
				fill(0);
				noStroke();
				textSize(12);
				textFont("Arial");
				textAlign(CENTER, CENTER);
				text(this.message, 0, -15);
			pop();
		}
	}

	this.open = function(){
		this.window.open();
		this.visible = true;
	}

	this.close = function(){
		this.window.close();
		this.visible = false;
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
		this.window = new p5Window("Warning!", this.pos.x, this.pos.y, this.width, this.height);
		this.window.addButton("Continue", this.pos.x + 45, this.pos.y + 20, 70, 20, continue_listener);
		this.window.addButton("Cancel", this.pos.x - 45, this.pos.y + 20, 70, 20, cancel_listener);
		if (was_open)
			this.open();
	}
}