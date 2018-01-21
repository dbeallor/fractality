function Fractal(nodes, edges){
	this.nodes = nodes || [new FractalNode(0, 0)];
	this.edges = edges || [];
	this.creating_seed = true;
	this.orienting_seed = false;
	this.creating_frame = false;
	this.fractalizing = false;
	this.maxing_out = false;
	var d = pixelDensity();
	this.graphics = createGraphics(d * windowWidth, d * windowHeight);
	this.seed = new FractalSeed();
	this.frame = new FractalSeed();
	this.edges_drawn = true;
	this.temp_nodes = [];
	this.temp_edges = [];
	this.rotation_center = createVector(grid.pos.x, grid.pos.y);
	this.current_edge;
	this.level = 1;
	this.viewing_seed = false;

	this.show = function(){
		if ((this.creating_seed || this.creating_frame) && tutorial.idle()){
			this.followMouseWithNode();
			this.showSeedWIP();
		}
		else if (this.orienting_seed || this.orienting_frame){
			if (onScreen() && noOpenWindows() && (menu_bar.folderIsOpen() < 0 || tutorial.idle()))
				this.refreshEdgeType();
			this.showSelection();
		}
		else if (this.fractalizing && !this.maxing_out)
			this.advance();

		else if (this.viewing_seed)
			this.seed.show();
		
		if (this.maxing_out && ready)
			this.maxOutAux();

		else if (!this.edges_drawn)
			this.refresh();

		var d = pixelDensity();
		imageMode(CORNER);
		image(this.graphics, 0, 0, this.graphics.width / d, this.graphics.height / d);
	}

	this.onClick = function(){
		// Seed creation mouse events
		if (this.creating_seed && onScreen() && this.notDoubledUp() && menu_bar.folderIsOpen() < 0 && noOpenWindows() && tutorial.idle() && ready){
			this.updateSeed();
			ready = false;
		}

		// Seed orientation mouse events
		if (this.orienting_seed && onScreen() && (menu_bar.folderIsOpen() || tutorial.idle()) < 0 && noOpenWindows() && ready){
			if (tutorial.current_window == 4){
				if (this.seed.edges[this.current_edge - 1].type == 0 || this.seed.edges[this.current_edge - 1].type == 1)
					this.updateGenerator(false, false);
			}
			else
				this.updateGenerator(false, false);
			ready = false;
		}

		// Frame creation mouse events
		if (this.creating_frame && onScreen() && this.notDoubledUp() && menu_bar.folderIsOpen() < 0 && noOpenWindows() && tutorial.idle() && ready){
			this.updateSeed();
			ready = false;
		}

		// Frame orientation mouse events
		if (this.orienting_frame && onScreen() && (menu_bar.folderIsOpen() || tutorial.idle()) < 0 && noOpenWindows() && ready){
			if (tutorial.current_window == 6){
				if (this.frame.edges[this.current_edge - 1].type == 0 || this.frame.edges[this.current_edge - 1].type == 1)
					this.updateFrameOrientation(false, false);
			}
			else
				this.updateFrameOrientation(false, false);
			ready = false;
		}
	}

	// =======================================================================================================
	// ==Seed Creation
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

		if (this.edges.length > 0)
			this.edges[this.edges.length - 1].setEnd(this.nodes[this.nodes.length - 1].pos.x, this.nodes[this.nodes.length - 1].pos.y);
	}

	this.showSeedWIP = function(){
		this.graphics.clear();
		if (onScreen() && noOpenWindows() && menu_bar.folderIsOpen() < 0){
			for (var i = 0; i < this.edges.length; i++)
				this.edges[i].show();

			for (var i = 0; i < this.nodes.length; i++)
				this.nodes[i].show();
		}
		else{
			for (var i = 0; i < this.edges.length - 1; i++)
				this.edges[i].show();

			for (var i = 0; i < this.nodes.length - 1; i++)
				this.nodes[i].show();
		}
	}

	this.notDoubledUp = function(){
		if (this.nodes.length < 2)
			return true;
		return !(this.nodes[this.nodes.length - 2].pos.equals(this.nodes[this.nodes.length - 1].pos));
	}

	this.updateSeed = function(){
		this.nodes = append(this.nodes, new FractalNode(0, 0));
		this.edges = append(this.edges, new FractalEdge(this.nodes[this.nodes.length - 2].pos, this.nodes[this.nodes.length - 1].pos, 2, 0, color(200)));
	}

	this.undoNode = function(){
		if (this.nodes.length > 1){
			this.nodes.splice(fractal.nodes.length-1, 1);
			this.edges.splice(fractal.nodes.length-1, 1);
		}
	}

	// =======================================================================================================
	// ==SEED ORIENTATION
	// =======================================================================================================
	this.setupForGeneratorCreation = function(){
		this.nodes.splice(this.nodes.length - 1, 1);
		this.edges.splice(this.edges.length - 1, 1);

		for (var i = 0; i < this.edges.length; i++)
			this.edges[i].setWeight(1);

		this.seed.recordData(this.nodes, this.edges);

		this.seed.nodes = this.nodeCopy(this.nodes);
		this.seed.edges = this.edgeCopy(this.edges);

		this.current_edge = this.nodes.length - 1;
		this.creating_seed = false;
		this.orienting_seed = true;
	}

	this.nodeCopy = function(n){
		if (n.length > 1){
			var result = [];
			for (var i = 0; i < n.length; i++)
				result[i] = new FractalNode(n[i].pos.x, n[i].pos.y);
		}
		else
			return new FractalNode(n[0].pos.x, n[0].pos.y);
		return result;
	}

	this.edgeCopy = function(e){
		var result = [];
		for (var i = 0; i < e.length; i++)
			result[i] = new FractalEdge(e[i].start, e[i].end, e[i].weight, e[i].type, e[i].stroke);
		return result;
	}

	this.refreshEdgeType = function(){
		var idx = this.current_edge;
		if (aboveLine(mouseX, mouseY, this.nodes[idx - 1].pos.x, this.nodes[idx - 1].pos.y, this.nodes[idx].pos.x, this.nodes[idx].pos.y)){
			if (toTheLeft(mouseX, mouseY, this.nodes[idx - 1].pos.x, this.nodes[idx - 1].pos.y, this.nodes[idx].pos.x, this.nodes[idx].pos.y)){
				this.edges[idx - 1].setType(1);
				if (this.orienting_seed)
					this.seed.edges[idx - 1].setType(1);
				else
					this.frame.edges[idx - 1].setType(1);
			}
			else{
				this.edges[idx - 1].setType(0);
				if (this.orienting_seed)
					this.seed.edges[idx - 1].setType(0);
				else
					this.frame.edges[idx - 1].setType(0);
			}
		}
		else{
			if (toTheLeft(mouseX, mouseY, this.nodes[idx - 1].pos.x, this.nodes[idx - 1].pos.y, this.nodes[idx].pos.x, this.nodes[idx].pos.y)){
				this.edges[idx - 1].setType(3);
				if (this.orienting_seed)
					this.seed.edges[idx - 1].setType(3);
				else
					this.frame.edges[idx - 1].setType(3);
			}
			else {
				this.edges[idx - 1].setType(2);
				if (this.orienting_seed)
					this.seed.edges[idx - 1].setType(2);
				else
					this.frame.edges[idx - 1].setType(2);
			}
		}
	}

	this.showSelection = function(){
		this.graphics.clear();
		var result = this.subdivide(this.current_edge);
		this.temp_nodes = result[0];
		this.temp_edges = result[1];

		for (var i = 0; i < this.current_edge - 1; i++)
			this.edges[i].show();

		if (onScreen() && (menu_bar.folderIsOpen() < 0 || tutorial.idle()) && noOpenWindows()){
			for (var i = 0; i < this.temp_edges.length; i++){
				if (this.temp_edges[i].type < 5)
					this.temp_edges[i].show();
			}
		}
		else if (this.edges[this.current_edge - 1].type < 5)
			this.edges[this.current_edge - 1].show();

		for (var i = this.current_edge; i < this.edges.length; i++)
			if (this.edges[i].type < 5)
				this.edges[i].show();

		var nodes = this.orienting_seed ? this.seed.nodes : this.frame.nodes;
		for (var i = 0; i < nodes.length; i++){
			if (i == this.current_edge || i == this.current_edge - 1){
				nodes[i].setSize(15);
				nodes[i].setFill(color(243,53,53));
			}
			nodes[i].show();
			nodes[i].setSize(10);
			nodes[i].setFill(color(30));
			nodes[i].show();
		}
	}

	this.subdivide = function(idx){
		var new_base = createVector(this.nodes[idx].pos.x - this.nodes[idx - 1].pos.x, this.nodes[idx].pos.y - this.nodes[idx - 1].pos.y);
		var angle_offset = polarAngle(new_base.x, new_base.y);
		var mag_scaler = new_base.mag();
		var new_nodes = [];
		var new_edges = [];
		var x, y;

		var result = this.getSeedData(idx);
		var mags = result[0];
		var angles = result[1];
		var types = result[2];		

		// Determine whether to flip the seed
		var neg = this.flipOrNot(idx);
		
		// For each new node in the seed
		for (var j = 0; j < types.length - 1; j++) {
			// Get the new node's coordinates
			x = this.nodes[idx-1].pos.x + mags[j] * mag_scaler * Math.cos(neg * angles[j] + angle_offset);
			y = this.nodes[idx-1].pos.y + mags[j] * mag_scaler * Math.sin(neg * angles[j] + angle_offset);

			// Add a node with these coordinates to the nodes array
			new_nodes = append(new_nodes, new FractalNode(x, y));

			// Get type for new edge
			var new_type = this.getNewType(this.edges[idx - 1].type, types[j]);

			// Add an edge between this node and the previous one
			if (j-1 >= 0)
				new_edges = append(new_edges, new FractalEdge(new_nodes[j-1].pos, new_nodes[j].pos, 1, new_type, color(200)));
			// 													start                 end   weight  type         stroke
			else
				new_edges = append(new_edges, new FractalEdge(this.nodes[idx-1].pos, new_nodes[j].pos, 1, new_type, color(200)));
		}

		// Finally, add an edge connecting the last node in the seed to the next node in nodes
		new_type = this.getNewType(this.edges[idx - 1].type, types[types.length - 1]);
		new_edges = append(new_edges, new FractalEdge(new_nodes[new_nodes.length - 1].pos, this.nodes[idx].pos, 1, new_type, color(200)));
		return [new_nodes, new_edges];
	}

	this.getSeedData = function(idx){
		// Determine whether to read the seed in forward or reverse order
		var mags, angles, types;
		if (this.edges[idx - 1].type == 1 || this.edges[idx - 1].type == 3){
			mags = this.seed.mags_r;
			angles = this.seed.angles_r;
			types = this.seed.types_r;
		}
		else {
			mags = this.seed.mags;
			angles = this.seed.angles;
			types = this.seed.types;
		}
		return [mags, angles, types];
	}

	this.flipOrNot = function(idx){
		var neg;
		if (this.edges[idx - 1].type == 0 || this.edges[idx - 1].type == 3)
			neg = -1;
		else 
			neg = 1;
		return neg;
	}

	this.getNewType = function(current_type, t){
		var new_type;
		switch(t){
			case 0: new_type = current_type; break;
			case 1:
				switch(current_type){
					case 0: new_type = 1; break;
					case 1: new_type = 0; break;
					case 2: new_type = 3; break;
					case 3: new_type = 2; break;
				} break;
			case 2:
				switch(current_type){
					case 0: new_type = 2; break;
					case 1: new_type = 3; break;
					case 2: new_type = 0; break;
					case 3: new_type = 1; break;
				} break;
			case 3: 
				switch(current_type){
					case 0: new_type = 3; break;
					case 1: new_type = 2; break;
					case 2: new_type = 1; break;
					case 3: new_type = 0; break;
				} break;
		}
		if (current_type == 4 || t == 4)
			new_type = 4;

		if (current_type == 5 || t == 5)
			new_type = 5;

		return new_type;
	}

	this.updateGenerator = function(skip, hide){
		var idx = this.current_edge;
		if (!skip && !hide){
			this.seed.edges[idx-1].setType(this.edges[idx-1].type);
			this.seed.types[idx-1] = this.edges[idx-1].type;
			this.seed.types_r[this.seed.types_r.length - idx] = this.edges[idx-1].type;
		}
		else if (skip){
			this.seed.edges[idx-1].setType(4);
			this.seed.types[idx-1] = 4;
			this.seed.types_r[this.seed.types_r.length - idx] = 4;
		}
		else if (hide){
			this.seed.edges[idx-1].setType(5);
			this.seed.types[idx-1] = 5;
			this.seed.types_r[this.seed.types_r.length - idx] = 5;
		}

		this.edges = this.edgeCopy(this.seed.edges);
		this.nodes = this.nodeCopy(this.seed.nodes);
		for (var i = this.edges.length - 1; i >= idx - 1; i--){
			if (this.edges[i].type < 4)
				this.update(i + 1);
		}

		this.current_edge--;
		if (this.current_edge == 0)
			this.setupForFrameCreation();
	}

	this.update = function(e){
		var result = this.subdivide(e);
		this.temp_nodes = result[0];
		this.temp_edges = result[1];
		this.edges.splice(e - 1, 1);
		this.edges = splice(this.edges, this.temp_edges, e - 1);
		this.nodes = splice(this.nodes, this.temp_nodes, e);

		if (this.fractalizing && !this.maxing_out)
			for (var i = this.temp_edges.length - 1; i >= 0; i--)
				if (this.temp_edges[i].type < 5)
					this.temp_edges[i].show();
	}

	this.undoOrientation = function(){
		if (this.current_edge <= this.edges.length) {
			this.edges[this.current_edge].setType(0);
			if (this.orienting_seed){
				this.seed.edges[this.current_edge].setType(0);
				this.seed.types[this.current_edge] = 0;
				this.seed.types_r[this.seed.types_r.length - this.current_edge - 1] = 0;
			}
			else{
				this.frame.edges[this.current_edge].setType(0);
				this.frame.types[this.current_edge] = 0;
			}
			var stop = this.current_edge + 1;
			this.edges = this.edgeCopy(this.orienting_seed ? this.seed.edges : this.frame.edges);
			this.nodes = this.nodeCopy(this.orienting_seed ? this.seed.nodes : this.frame.nodes);
			this.current_edge = this.nodes.length - 1;
			for (var i = this.edges.length - 1; i >= stop; i--){
				if (this.edges[i].type == 4)
					this.updateGenerator(true, false);
				else if (this.edges[i].type == 5)
					this.updateGenerator(false, true);
				else
					this.updateGenerator(false, false);
			}
			this.refresh();
		}
	}

	this.skipEdge = function(){
		this.orienting_seed ? this.updateGenerator(true, false) : this.updateFrameOrientation(true, false);
	}

	this.hideEdge = function(){
		this.orienting_seed ? this.updateGenerator(false, true) : this.updateFrameOrientation(false, true);
	}

	// =======================================================================================================
	// ==FRAME CREATION
	// =======================================================================================================
	this.setupForFrameCreation = function(){
		this.nodes = [new FractalNode(0, 0)];
		this.edges = [];
		this.orienting_seed = false;
		this.creating_frame = true;
		refreshMenuBarButtons();
	}

	// =======================================================================================================
	// ==FRAME ORIENTATION
	// =======================================================================================================
	this.setupForFrameOrientation = function(){
		this.nodes.splice(this.nodes.length - 1, 1);
		this.edges.splice(this.edges.length - 1, 1);

		for (var i = 0; i < this.edges.length; i++)
			this.edges[i].setWeight(1);

		this.frame.recordData(this.nodes, this.edges);

		this.frame.nodes = this.nodeCopy(this.nodes);
		this.frame.edges = this.edgeCopy(this.edges);

		this.current_edge = this.nodes.length - 1;
		this.creating_frame = false;
		this.orienting_frame = true;
	}

	this.updateFrameOrientation = function(skip, hide){
		var idx = this.current_edge;
		if (!skip && !hide){
			this.frame.edges[idx-1].setType(this.edges[idx-1].type);
			this.frame.types[idx-1] = this.edges[idx-1].type;
		}
		else if (skip){
			this.frame.edges[idx-1].setType(4);
			this.frame.types[idx-1] = 4;
		}
		else if (hide){
			this.frame.edges[idx-1].setType(5);
			this.frame.types[idx-1] = 5;
		}

		this.edges = this.edgeCopy(this.frame.edges);
		this.nodes = this.nodeCopy(this.frame.nodes);
		for (var i = this.edges.length - 1; i >= idx - 1; i--){
			if (this.edges[i].type < 4)
				this.update(i + 1);
		}

		this.current_edge--;
		if (this.current_edge == 0)
			this.setupForFractalization();
	}

	// =======================================================================================================
	// ==FRACTALIZATION
	// =======================================================================================================
	this.setupForFractalization = function(){
		this.scaleColors();
		this.refreshRotationCenter();
		this.orienting_frame = false;
		refreshMenuBarButtons();
		this.edges_drawn = false;
	}

	this.scaleColors = function(){
		var l = this.edges.length;
		var r, g, b;
		for (var i = 0; i < l; i++){
			// Map position in edges array to value between 0 and 1
			var x = map(i, 0, l-1, 0, 1);
			this.edges[i].setStroke(colorMap(x));
		}
	}

	this.refreshRotationCenter = function(){
		this.rotation_center.set(0, 0)
		var normalizer = 0;
		for (var i = 0; i < this.edges.length; i++){
			if (this.edges[i].type < 5){
				this.rotation_center.add(this.edges[i].midpoint());
				normalizer++;
			}
		}
		this.rotation_center.mult(1 / normalizer);
	}

	this.refresh = function(){
		this.graphics.clear();
		var normalizer = 0;
		for (var i =  this.edges.length - 1; i >= 0; i--){
			if (this.edges[i].type != 5 && this.edges[i].onScreen()){
				this.edges[i].show();
				normalizer++;
			}
		}
		this.edges_drawn = true;
	}

	this.idle = function(){
		return (!this.creating_seed && !this.orienting_seed && !this.creating_frame && !this.orienting_frame && !this.fractalize);
	}

	this.translate = function(deltaX, deltaY){
		for (var i = 0; i < this.nodes.length; i++){
			this.nodes[i].setPosition([this.nodes[i].pos.x + deltaX, this.nodes[i].pos.y + deltaY]);
			if (i > 0){
				this.edges[i-1].setStart(this.edges[i-1].start.x + deltaX, this.edges[i-1].start.y + deltaY);
				this.edges[i-1].setEnd(this.edges[i-1].end.x + deltaX, this.edges[i-1].end.y + deltaY);
			}
		}

		for (var i = 0; i < this.seed.nodes.length; i++){
			this.seed.nodes[i].setPosition([this.seed.nodes[i].pos.x + deltaX, this.seed.nodes[i].pos.y + deltaY]);
			if (i > 0){
				this.seed.edges[i-1].setStart(this.seed.edges[i-1].start.x + deltaX, this.seed.edges[i-1].start.y + deltaY);
				this.seed.edges[i-1].setEnd(this.seed.edges[i-1].end.x + deltaX, this.seed.edges[i-1].end.y + deltaY);
			}
		}

		this.edges_drawn = false;
	}

	this.rotate = function(angle){
		for (var i = 0; i < this.nodes.length; i++){
			this.nodes[i].rotate(angle, this.rotation_center);
			if (i > 0)
				this.edges[i-1].rotate(angle, this.rotation_center);
		}

		for (var i = 0; i < this.seed.nodes.length; i++){
			this.seed.nodes[i].rotate(angle, this.rotation_center);
			if (i > 0)
				this.seed.edges[i-1].rotate(angle, this.rotation_center);
		}
		this.edges_drawn = false;
	}

	this.center = function(){
		this.refreshRotationCenter();
		if (this.edgeOnScreen()) {
			var deltaX = grid.pos.x - this.rotation_center.x;
			var deltaY = grid.pos.y - this.rotation_center.y;
			this.translate(deltaX, deltaY);
		}
	}

	this.zoom = function(delta, center){
		for (var i = 0; i < this.nodes.length; i++){
			var new_pos = scalePoint(this.nodes[i].pos.x, this.nodes[i].pos.y, delta, center);
			this.nodes[i].setPosition([new_pos[0], new_pos[1]]);
			if (i > 0){
				var new_start = scalePoint(this.edges[i-1].start.x, this.edges[i-1].start.y, delta, center);
				this.edges[i-1].setStart(new_start[0], new_start[1]);

				var new_end = scalePoint(this.edges[i-1].end.x, this.edges[i-1].end.y, delta, center);
				this.edges[i-1].setEnd(new_end[0], new_end[1]);
			}
		}

		for (var i = 0; i < this.seed.nodes.length; i++){
			var new_pos = scalePoint(this.seed.nodes[i].pos.x, this.seed.nodes[i].pos.y, delta, center);
			this.seed.nodes[i].setPosition([new_pos[0], new_pos[1]]);
			if (i > 0){
				var new_start = scalePoint(this.seed.edges[i-1].start.x, this.seed.edges[i-1].start.y, delta, center);
				this.seed.edges[i-1].setStart(new_start[0], new_start[1]);

				var new_end = scalePoint(this.seed.edges[i-1].end.x, this.seed.edges[i-1].end.y, delta, center);
				this.seed.edges[i-1].setEnd(new_end[0], new_end[1]);
			}
		}

		this.edges_drawn = false;
	}

	this.getReadyToFractalize = function(){
		if (!this.fractalizing){
			this.graphics.clear();
			this.prev_edge_count = this.edges.length;

			var num_unreplaced = 0;
			for (var i = 0; i < this.edges.length; i++){
				if (this.edges[i].type > 3)
					num_unreplaced++;
			}

			this.next_edge_count = num_unreplaced + (this.edges.length - num_unreplaced) * this.seed.types.length;
			if (this.next_edge_count <= 50000){
				this.current_edge = this.edges.length;
				this.fractalizing = true;
				this.level++;
			}
			else if (!this.maxing_out){
				this.nodes = this.nodeCopy(this.frame.nodes);
				this.edges = this.edgeCopy(this.frame.edges);
				this.edges_drawn = false;
				this.level = 1;
				this.scaleColors();
			}
		}	
	}

	this.advance = function(){
		var speed = constrain(floor(this.edges.length / 50), 20, 200);
		for (var i = 0; i < speed; i++){
			if (this.edges[this.current_edge - 1].type < 4)
				this.update(this.current_edge);
			else if (this.edges[this.current_edge - 1].type == 4 && !this.maxing_out)
				this.edges[this.current_edge - 1].show();
			this.current_edge--;
			if (this.current_edge == 0){
				this.fractalizing = false;
				this.edges_drawn = false;
				break;
			}
		}
	}

	this.maxOut = function() {
		this.maxing_out = true;
	}

	this.maxOutAux = function(){
		var start_time = millis();
		while (true) {
			this.getReadyToFractalize();
			if (this.next_edge_count <= 50000 && millis() - start_time < 12500){
				while (this.current_edge > 0)
					this.advance();
			}
			else break;
		} 
		this.scaleColors();
		this.maxing_out = false;
		ready = false;
	}

	this.viewSeed = function(){
		this.viewing_seed = true;
	}

	this.viewFractal = function(){
		this.viewing_seed = false;
		this.refresh();
	}

	this.edgeOnScreen = function(){
		for (var i = 0; i < this.edges.length; i++){
			if (this.edges[i].type < 5 && this.edges[i].onScreen())
				return true;
		}
		return false;
	}

	this.resize = function(x, y){
		this.graphics = createGraphics(x, y);
		this.edges_drawn = false;
	}
}