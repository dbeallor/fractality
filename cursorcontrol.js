function CursorControl(x, y){
	this.pos = createVector(x, y);
	this.fill = color(235);
	this.highlight = color(97, 155, 249);
	this.width = 31;
	this.drag_size = 10;
	this.height = 3 * this.width + this.drag_size;
	this.mode = 0;
	this.bounds = [this.pos.x, this.pos.x + this.width, this.pos.y, this.pos.y + this.height];
	this.drag_bounds = [this.pos.x, this.pos.x + this.width, this.pos.y, this.pos.y + this.drag_size];
	this.cursor_bounds = [this.pos.x, this.pos.x + this.width, this.pos.y + this.drag_size, this.pos.y + this.width + this.drag_size];
	this.zoom_bounds = [this.pos.x, this.pos.x + this.width, this.pos.y + this.width + this.drag_size, this.pos.y + 2 * this.width + this.drag_size];
	this.rotate_bounds = [this.pos.x, this.pos.x + this.width, this.pos.y + 2 * this.width + this.drag_size, this.pos.y + 3 * this.width + this.drag_size];

	this.show = function(){
		push();
			resetMatrix();
			imageMode(CENTER);
			stroke(0);
			fill(130);
			rect(this.pos.x, this.pos.y, this.width, 10, 3, 3, 0, 0);
			
			fill(this.mode == 0 ? this.highlight : this.fill);
			rect(this.pos.x, this.pos.y + this.drag_size, this.width, this.width);
			image(move_icon, this.pos.x + this.width / 2, this.pos.y + this.width - 5, 21, 20);

			fill(this.mode == 1 ? this.highlight : this.fill);
			rect(this.pos.x, this.pos.y + this.width + this.drag_size, this.width, this.width);
			image(zoom_icon, this.pos.x + this.width / 2, this.pos.y + 2 * this.width - 5, 23, 23);

			fill(this.mode == 2 ? this.highlight : this.fill);
			rect(this.pos.x, this.pos.y + 2 * this.width + this.drag_size, this.width, this.width, 0, 0, 3, 3);
			image(rotate_icon, this.pos.x + this.width / 2, this.pos.y + 3 * this.width - 5, 20, 20);
		pop();
	}

	this.setPosition = function(x, y){
		this.pos.x = x;
		this.pos.y = y;
	}

	this.resetBounds = function(x, y){
		this.bounds = [this.pos.x, this.pos.x + this.width, this.pos.y, this.pos.y + this.height];
		this.drag_bounds = [this.pos.x, this.pos.x + this.width, this.pos.y, this.pos.y + 10];
		this.cursor_bounds = [this.pos.x, this.pos.x + this.width, this.pos.y + 10, this.pos.y + this.width + 10];
		this.zoom_bounds = [this.pos.x, this.pos.x + this.width, this.pos.y + this.width + 10, this.pos.y + 2 * this.width + 10];
		this.rotate_bounds = [this.pos.x, this.pos.x + this.width, this.pos.y + 2 * this.width + 10, this.pos.y + 3 * this.width + 10];
	}

	this.setMode = function(m){
		this.mode = m;
	}
}