function LFractal(){
	this.nodes = [new FractalNode(0, 0)];
	// this.data = [[Math.PI / 4, 100], [Math.PI / 4, 100], [Math.PI / 4, 100]];
	this.data = [];
	this.start = createVector(windowWidth / 2, windowHeight / 2);
	this.len = 20;

	this.seed = new LFractalSeed();
	this.frame = new LFractalSeed();
	this.frame.building = false;

	this.fractalizing = false;

	var d = pixelDensity();
	this.graphic = createGraphics(d * windowWidth, d * windowHeight);

	this.show = function(){
		if (tutorial.idle()){
			if (this.seed.building || this.seed.orienting)
				this.seed.show();
			if (this.frame.building || this.frame.orienting)
				this.frame.show();
		}
		resetMatrix();
		var d = pixelDensity();
		image(this.graphic, 0, 0, this.graphic.width / d, this.graphic.height / d);
	}

	this.onClick = function(){
		if (this.seed.building && this.seed.notDoubledUp())
			this.seed.update();
	}

	this.refresh = function(stop){
		if (this.data.length > 0){
			this.graphic.clear();
			this.graphic.resetMatrix();
			this.graphic.translate(this.start.x, this.start.y);

			for (var i = 0; i < this.data.length; i++){
				var type = this.data[0][i];
				var instructions = this.data[type][i];
				this.graphic.rotate(instructions[0]);
				this.graphic.stroke(255);
				this.graphic.line(0,0,0,-instructions[1]);
				this.graphic.translate(0,-instructions[1]);
			}
		}
	}

	this.idle = function(){
		return (!this.seed.building && !this.frame.building && ! this.seed.orienting && ! this.frame.orienting && !this.fractalizing);
	}

	this.resize = function(x, y){
		this.graphics = createGraphics(x, y);
		this.refresh();
	}

	this.undoNode = function(){
		if (this.seed.building)
			this.seed.nodes.splice(this.seed.nodes.length - 1, 1);
		if (this.frame.building)
			this.frame.nodes.splice(this.frame.nodes.length - 1, 1);
	}

}

// function turtle(str) {
// 	graphic.background(51);
// 	graphic.resetMatrix();
// 	graphic.translate(width/2, height);
// 	r_scale = windows[0].rSlider.value();
// 	g_scale = windows[0].gSlider.value();
// 	b_scale = windows[0].bSlider.value();
// 	var prev_len = [];
// 	var prev_r = [];
// 	var prev_g = [];
// 	var prev_b = [];
// 	for (var i=0; i<str.length; i++){
// 		if (i!=str.length-1){
// 			if (str.charAt(i) == "F"){
// 				graphic.stroke(r,g,b);
// 				graphic.line(0,0,0,-this.len);
// 				graphic.translate(0,-this.len);
// 			}
// 			else if (str.charAt(i) == "+"){
// 				graphic.rotate(radians(15));
// 			}
// 			else if (str.charAt(i) == "-"){
// 				graphic.rotate(-radians(15));
// 			}
// 			else if (str.charAt(i) == "["){
// 				prev_len.push(len);
// 				prev_r.push(r);
// 				prev_g.push(g);
// 				prev_b.push(b);
// 				if (writing){
// 					graphic.push();
// 					graphic.stroke(200,200,0);
// 					graphic.strokeWeight(10);
// 					graphic.point(0,0);
// 					graphic.pop();
// 				}
// 				graphic.push();
// 			}
// 			else if (str.charAt(i) == "]"){
// 				len = prev_len.pop();
// 				r = prev_r.pop();
// 				g = prev_g.pop();
// 				b = prev_b.pop();
// 				graphic.pop();
// 			}
// 		}
// 		else if (writing){
// 			graphic.push();
// 			graphic.stroke(200,200,0);
// 			graphic.strokeWeight(3);
// 			graphic.line(0,0,0,-len);
// 			graphic.pop();
// 		}
// 	}
// 	len = windowHeight * (1/4);
// 	r = 255;
// 	g = 255;
// 	b = 255;
// }