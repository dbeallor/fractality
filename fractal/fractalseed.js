function FractalSeed(nodes, edges, mags, angles, types, mags_r, angles_r, types_r){
	this.nodes = nodes || [];
	this.edges = edges || [];
	this.mags = mags || [];
	this.angles = angles || [];
	this.types = types || [];
	this.mags_r = mags_r || [];
	this.angles_r = angles_r || [];
	this.types_r = types_r || [];

	this.show = function(){
		// fractal.graphics.clear();
		for (var i = 0; i < this.edges.length; i++){
			this.edges[i].setWeight(2);
			switch (this.edges[i].type){
				case 4: this.edges[i].setStroke(color(0, 0, 255)); break;
				case 5: this.edges[i].setStroke(color(255, 0, 0)); break;
			}
			this.edges[i].show();
			this.edges[i].setWeight(1);
			this.edges[i].setStroke(color(200));
		}

		for (var i = 0; i < this.nodes.length; i++){
			if (i == 0 || i == this.nodes.length - 1)
				this.nodes[i].setSize(15);
			this.nodes[i].show();
			this.nodes[i].setSize(10);
		}
	}

	this.recordData = function(nodes, edges){
		var base = createVector(nodes[nodes.length-1].pos.x - nodes[0].pos.x, nodes[nodes.length-1].pos.y - nodes[0].pos.y);
		var sub = createVector(0, 0);
		var base_r = createVector(nodes[0].pos.x - nodes[nodes.length-1].pos.x, nodes[0].pos.y - nodes[nodes.length-1].pos.y);
		var sub_r = createVector(0, 0);
		for (var i = 0; i < nodes.length - 2; i++){
			// SEED DATA - FORWARD DIRECTION
			// Record the polar coordinates and types of the seed nodes with respect to the vector n1->n2
			sub.x = nodes[i+1].pos.x - nodes[0].pos.x;
			sub.y = nodes[i+1].pos.y - nodes[0].pos.y;
			this.mags[i] = sub.mag() * 1.0 / base.mag();
			this.angles[i] = angleBetween(sub, base);
			this.types[i] = 0;

			// SEED DATA - REVERSE DIRECTION
			// Record the polar coordinates and types of the seed nodes with respect to the vector n2->n1
			sub_r.x = nodes[nodes.length - 2 - i].pos.x - nodes[nodes.length - 1].pos.x;
			sub_r.y = nodes[nodes.length - 2 - i].pos.y - nodes[nodes.length - 1].pos.y;

			this.mags_r[i] = sub_r.mag() * 1.0 / base_r.mag();
			this.angles_r[i] = angleBetween(sub_r, base_r);
			this.types_r[i] = 0;
		}

		// Add dummy data point at the end of the types array to hold type of final edge connecting the seed back to the shape
		this.types[nodes.length - 2] = 0;
		this.types_r[nodes.length - 2] = 0;
	}
}