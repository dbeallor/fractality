function Grid(x, y, w){
	this.pos = createVector(x, y);
	this.w = w;

	// Square Gridline Attributes
	this.num_gridlines = this.w > 1000 ? 149 : 99;
	this.offset = ((this.num_gridlines + 1) / 2) - 1;
	this.gap = this.w / (this.num_gridlines + 1);
	this.type = 0;
	this.square_coords = []

	// Initialize Square Coords
	for (var i = 0; i < this.num_gridlines; i++){
		this.square_coords[i] = [];
		for (var j = 0; j < this.num_gridlines; j++){
			this.square_coords[i][j] = [this.pos.x + (i - this.offset) * this.gap, this.pos.y + (j - this.offset) * this.gap];
		}
	}

	// Set current coords to square coords upon construction
	this.coords = this.square_coords;

	// Triangle Gridline Attributes
	this.num_h_lines = 99;
	this.v_gap = this.w / (this.num_h_lines + 1);
	this.h_gap = 2 * this.v_gap * tan(PI / 6);
	this.r = this.w / 2;
	this.h_dist = ((this.num_h_lines + 1)*(this.w / (this.num_h_lines + 1)))*tan(PI / 6);
	this.h_offset = ((this.num_h_lines + 1) / 2);
	this.v_offset = ((this.num_h_lines + 1) / 2);
	this.triangle_coords = []

	// Initialize Triangle Coords
	for (var i = 0; i < this.num_h_lines; i++){
		this.triangle_coords[i] = [];
		for (var j = 0; j < 2*this.num_h_lines; j++){
			if (i % 2 == 0)
				this.triangle_coords[i][j] = [this.pos.x + this.h_gap * (j - this.h_offset), this.pos.y + this.v_gap * (i - this.v_offset)];
			else
				this.triangle_coords[i][j] = [this.pos.x + this.h_gap * (j - this.h_offset) - this.h_gap/2, this.pos.y + this.v_gap * (i - this.v_offset)];
		}
	}

	this.setType = function(t){
		this.type = t;
		this.refreshCoords();
	}

	this.show = function() {
		if (this.type == 0)
			this.drawSquareGrid();
		else if (this.type == 1)
			this.drawTriangleGrid();
	}

	this.refreshCoords = function(){
		if (this.type == 0)
			this.coords = this.square_coords;
		else if (this.type == 1){
			this.coords = this.triangle_coords;
		}
	}

	this.drawSquareGrid = function(){
		push();
			translate(this.pos.x, this.pos.y);
			// Draw finest mesh
			for (var i = -this.offset * this.gap; i <= this.offset * this.gap; i += this.gap){
				if (round(i / this.gap) % 4 != 0){
					stroke(70);
					line(i, -this.w / 2, i, this.w / 2);
					line(-this.w / 2, i, this.w / 2, i);
				}
			}

			// Draw medium grid lines
			for (var i = -this.offset * this.gap; i <= this.offset * this.gap; i += this.gap){
				if (round(i / this.gap) % 4 == 0){
					stroke(90);
					line(i, -this.w / 2, i, this.w / 2);
					line(-this.w / 2, i, this.w / 2, i);
				}
			}

			// Draw strong grid lines
			for (var i = -this.offset * this.gap; i <= this.offset * this.gap; i += this.gap){
				if (round(i / this.gap) % 8 == 0){
					stroke(130);
					line(i, -this.w / 2, i, this.w / 2);
					line(-this.w / 2, i, this.w / 2, i);
				}
			}

			// Draw center lines
			stroke(180);
			line(0, -this.w / 2, 0, this.w / 2);
			line(-this.w / 2, 0, this.w / 2, 0);
		pop();
	}

	this.drawTriangleGrid = function(){
		push();
			translate(this.pos.x, this.pos.y);
			
			// Draw Weak Diagonal Lines
			stroke(70);
			for (var i = 0; i < this.num_h_lines; i++){
				line(i*this.h_gap, -this.r, i*this.h_gap + this.h_dist, this.r);
				line(-i*this.h_gap, -this.r, -i*this.h_gap + this.h_dist, this.r);
				line(i*this.h_gap, -this.r, i*this.h_gap - this.h_dist, this.r);
				line(-i*this.h_gap, -this.r, -i*this.h_gap - this.h_dist, this.r);
			}

			// Draw Weak Horizontal Lines
			stroke(70);
			for (var i = 0; i < (this.num_h_lines + 1) / 2 - 1; i++){
				line(-this.r, i * this.v_gap, this.r, i * this.v_gap);
				line(-this.r, -i * this.v_gap, this.r, -i * this.v_gap);
			}

			// Draw Medium Diagonal Lines
			for (var i = 0; i < this.num_h_lines; i++){
				if ((i-5) % 5 == 0){
					stroke(90);
					line(i*this.h_gap, -this.r, i*this.h_gap + this.h_dist, this.r);
					line(-i*this.h_gap, -this.r, -i*this.h_gap + this.h_dist, this.r);
					line(i*this.h_gap, -this.r, i*this.h_gap - this.h_dist, this.r);
					line(-i*this.h_gap, -this.r, -i*this.h_gap - this.h_dist, this.r);
				}
			}

			// Draw Medium Horizontal Lines
			for (var i = 0; i < (this.num_h_lines + 1) / 2 - 1; i++){
				if (i % 5 == 0){
					stroke(90);
					line(-this.r, i * this.v_gap, this.r, i * this.v_gap);
					line(-this.r, -i * this.v_gap, this.r, -i * this.v_gap);
				}
			}

			// Draw Strong Diagonal Lines
			for (var i = 0; i < this.num_h_lines; i++){
				if ((i-5) % 10 == 0){
					stroke(130);
					line(i*this.h_gap, -this.r, i*this.h_gap + this.h_dist, this.r);
					line(-i*this.h_gap, -this.r, -i*this.h_gap + this.h_dist, this.r);
					line(i*this.h_gap, -this.r, i*this.h_gap - this.h_dist, this.r);
					line(-i*this.h_gap, -this.r, -i*this.h_gap - this.h_dist, this.r);
				}
			}

			// Draw Strong Horizontal Lines
			for (var i = 0; i < (this.num_h_lines + 1) / 2 - 1; i++){
				if (i % 10 == 0){
					stroke(130);
					line(-this.r, i * this.v_gap, this.r, i * this.v_gap);
					line(-this.r, -i * this.v_gap, this.r, -i * this.v_gap);
				}
			}

			// Draw center lines
			stroke(180);
			line(0, -this.w / 2, 0, this.w / 2);
			line(-this.w / 2, 0, this.w / 2, 0);
		pop();
	}

	// Returns the closest grid coordinate to the point (x,y)
	this.closestGridPoint = function(x, y){
		closest_dist = 10000;
		closest_pos = [-1, -1];
		var d, i_x, j_x;
		for (var i = 0; i < this.coords.length; i++){
			for (var j = 0; j < this.coords.length; j++){
				d = dist(this.coords[i][j][0], this.coords[i][j][1], x, y);
				if (d < closest_dist){
					closest_dist = d;
					closest_pos = this.coords[i][j];
					i_x = i;
					j_x = j;
				}
			}
		}
		// fill(255);
		// text(i_x + ', ' + j_x, 50, 50);
		return closest_pos;
	}
}