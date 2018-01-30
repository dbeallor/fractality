function p5Button(label, x, y, width, height, listener){
	this.listener = listener;
	this.pos = createVector(x, y);
	this.width = width;
	this.height = height;
	this.fill = color(220);
	this.highlight = color(74,119,235);
	this.text_fill = color(0);
	this.text_highlight = color(255);
	this.bounds = [this.pos.x - this.width / 2, this.pos.x + this.width / 2, this.pos.y - this.height / 2, this.pos.y + this.height / 2];
	this.visible = false;
	this.label = label;
	this.text_size = 12;

	this.show = function(){
		if (this.visible){
			push();
				textSize(this.text_size);
				if (this.mouseOver()){
					canvas.style.cursor = 'pointer';
					fill(this.highlight)
				}
				else{
					fill(this.fill);
				}
				noStroke();
				resetMatrix();
				translate(this.pos.x, this.pos.y);
				rectMode(CENTER);
				rect(0, 0, this.width, this.height, 3);
				fill(this.text_fill);
				noStroke();
				textAlign(CENTER, CENTER);
				textFont("Arial");
				textStyle(BOLD);
				if (this.mouseOver())
					fill(this.text_highlight)
				else
					fill(this.text_fill);
				text(this.label, 0, 0);
			pop();
		}
	}

	this.setFill = function(f){
		this.fill = f;
	}

	this.setHighlight = function(h){
		this.highlight = h;
	}

	this.setTextFill = function(f){
		this.text_fill = f;
	}

	this.mouseOver = function(){
		return this.withinBounds(mouseX, mouseY, this.bounds);
	}

	this.withinBounds = function(x, y, bounds){
		return (x >= bounds[0] && x <= bounds[1] && y >= bounds[2] && y <= bounds[3]);
	}

	this.open = function(){
		this.visible = true;
	}

	this.close = function(){
		this.visible = false;
	}

	this.onClick = function(stay_open){
		if (this.mouseOver()){
			this.listener();
			stay_open || this.close();
		}
	}

	this.setPosition = function(x, y){
		this.pos.set(x, y);
	}

	this.setTextSize = function(ts){
		this.text_size = ts;
	}
}