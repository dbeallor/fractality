function FractalNode(x, y){
	this.pos = createVector(x, y);
	this.r = 10;

	this.show = function(){
		fractal.graphics.push();
			fractal.graphics.noStroke();
			fractal.graphics.fill(30);
			fractal.graphics.ellipse(this.pos.x, this.pos.y, this.r, this.r);
		fractal.graphics.pop();
	}

	this.setPosition = function(pos){
		this.pos.x = pos[0];
		this.pos.y = pos[1];
	}

	this.rotate = function(delta, center){
		this.pos = this.pos.sub(center).rotate(delta).add(center);
	}

	this.setSize = function(s){
		this.r = s;
	}
}