function ExitButton(x, y){
	this.pos = createVector(x, y);
	this.r = 8;
	this.bounds = [this.pos.x - this.r / 2, this.pos.x + this.r / 2, this.pos.y - this.r / 2, this.pos.y + this.r / 2];

	this.show = function(){
		push();
			resetMatrix();
			translate(this.pos.x, this.pos.y);
			rectMode(CENTER);
			noFill();
			stroke(30);
			strokeWeight(2);
			line(-this.r / 2, -this.r / 2, this.r / 2, this.r / 2);
			line(-this.r / 2, this.r / 2, this.r / 2, -this.r / 2);
		pop();
	}

	this.setPosition = function(x, y){
		this.pos.x = x;
		this.pos.y = y;
		this.resetBounds();
	}

	this.resetBounds = function(){
		this.bounds = [this.pos.x - this.r / 2, this.pos.x + this.r / 2, this.pos.y - this.r / 2, this.pos.y + this.r / 2];
	}

	this.withinBounds = function(x, y, bounds){
		return (x >= bounds[0] && x <= bounds[1] && y >= bounds[2] && y <= bounds[3]);
	}

	this.clicked = function(){
		return withinBounds(mouseX, mouseY, this.bounds);
	}
}