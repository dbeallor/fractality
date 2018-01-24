function LFractalSeed(){
	this.nodes = [new FractalNode(0, 0)];
	this.data = [];
	this.preview;
	this.building = true;
	this.orienting = false;
	this.start = createVector(0, 0);
	this.frame;

	var d = pixelDensity();
	this.graphic = createGraphics(d * windowWidth, d * windowHeight);

	this.show = function(){
		if (this.building)
			this.showNodes();

		if (this.orienting)
			this.refresh(this.preview);

		resetMatrix();
		var d = pixelDensity();
		image(this.graphic, 0, 0, this.graphic.width / d, this.graphic.height / d);
	}

	this.showNodes = function(){
		this.graphic.push();

		if (this.building){
			this.graphic.clear();
			this.followMouseWithNode();		
			this.graphic.stroke(255);
			for (var i = 1; i < this.nodes.length; i++)
				this.graphic.line(this.nodes[i-1].pos.x, this.nodes[i-1].pos.y, this.nodes[i].pos.x, this.nodes[i].pos.y);
		}
		for (var i = 0; i < this.nodes.length; i++)
			this.nodes[i].show();
		this.graphic.pop();
	}

	this.refresh = function(d, stop){
		var data = d || this.data;
		// print(data);
		if (data.length > 0){
			this.graphic.clear();
			this.graphic.resetMatrix();
			this.graphic.translate(this.start.x, this.start.y);

			for (var i = 0; i < data[0].length; i++){
				var type = data[0][i];
				var instructions = data[type][i];
				this.graphic.rotate(instructions[0]);
				this.graphic.stroke(255);
				this.graphic.line(0,0,0,-instructions[1]);
				this.graphic.translate(0,-instructions[1]);
			}
		}
	}

	// =======================================================================================================
	// ==SEED CREATION
	// =======================================================================================================
	this.followMouseWithNode = function(){
		if (onScreen()){
			var snap = [99999999, 99999999];
			if (grid.type == 0 || grid.type == 1)
				snap = grid.closestGridPoint(mouseX, mouseY);
			if (withinBounds(snap[0], snap[1], screen_bounds))
				this.nodes[this.nodes.length - 1].setPosition(snap);
			else
				this.nodes[this.nodes.length - 1].setPosition([mouseX, mouseY]);
		}
	}

	this.notDoubledUp = function(){
		if (this.nodes.length < 2)
			return true;
		return !(this.nodes[this.nodes.length - 2].pos.equals(this.nodes[this.nodes.length - 1].pos));
	}

	this.update = function(){
		this.nodes = append(this.nodes, new FractalNode(0, 0));
	}

	this.lock = function(){
		this.nodes.splice(this.nodes.length - 1, 1);
		this.recordData();
		this.building = false;
		this.orienting = true;
	}

	this.recordData = function(){
		this.start.set(this.nodes[0].pos.x, this.nodes[0].pos.y);

		for (var i = 0; i < 5; i++){
			this.data[i] = [];
		}

		var start = createVector(this.nodes[0].pos.x, this.nodes[0].pos.y);
		var end = createVector(this.nodes[this.nodes.length - 1].pos.x, this.nodes[this.nodes.length - 1].pos.y);
		var base = createVector(end.x - start.x, end.y - start.y);
		var edge = createVector(base.x, base.y);
		var prev_edge = createVector(0, 0);

		this.preview = [[1], [[Math.PI / 2 + polarAngle(base.x, base.y), base.mag()]]];

		for (var i = 1; i < this.nodes.length; i++){
			// Store dummy type
			this.data[0][i] = 1;

			prev_edge.set(edge.x, edge.y);
			edge.set(this.nodes[i].pos.x - this.nodes[i-1].pos.x, this.nodes[i].pos.y - this.nodes[i-1].pos.y);

			// Type 1
			// Store distance and -ve angle from start
			this.data[1][i] = [];
			this.data[1][i][0] = -angleBetween(edge, prev_edge);
			this.data[1][i][1] = edge.mag() / base.mag();
			
			// Type 2
			// Store distance and +ve angle from start
			this.data[2][i] = [];
			this.data[2][i][0] = angleBetween(edge, prev_edge);
			this.data[2][i][1] = edge.mag() / base.mag();
		}

		edge.set(-base.x, -base.y);
		base.mult(-1);
		for (var i = this.nodes.length - 1; i  > 0; i--){
			prev_edge.set(edge.x, edge.y);
			edge.set(this.nodes[i-1].pos.x - this.nodes[i].pos.x, this.nodes[i-1].pos.y - this.nodes[i].pos.y);

			// Type 3
			// Store distance and +ve angle from end
			this.data[3][i] = [];
			this.data[3][i][0] = angleBetween(edge, prev_edge);
			this.data[3][i][1] = edge.mag() / base.mag();
			
			// Type 4
			// Store distance and -ve angle from end
			this.data[4][i] = [];
			this.data[4][i][0] = -angleBetween(edge, prev_edge);
			this.data[4][i][1] = edge.mag() / base.mag();
		}
		base.mult(-1);
	}

	this.dataCopy = function(){
		var copy = [];
		for (var i = 0; i < this.data.length; i++){
			copy[i] = [];
			for (var j = 1; j < this.data[0].length; j++){
				if (i == 0)
					copy[i][j] == this.data[i][j];
				else {
					copy[i][j] = [];
					copy[i][j][0] = this.data[i][j][0];
					copy[i][j][1] = this.data[i][j][1];
				}
			}
		}
	}

	// =======================================================================================================
	// ==SEED ORIENTATION
	// =======================================================================================================
	this.update = function(l){
		var new_data = [];
		
	}
}