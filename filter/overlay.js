function Overlay(img, id){
	this.id = id;
	this.image = img;
	this.opacity = 0.5;
	this.workers = [];
	this.chunks = [];
	this.chunks_complete = 0;

	this.initialize = function(){
		this.image.loadPixels();
		for (var i = 3; i < this.image.pixels.length; i += 4)
			this.image.pixels[i] = floor(map(this.opacity, 0, 1, 0, 255));
		this.image.updatePixels();
		// for (var i = 0; i < navigator.hardwareConcurrency; i++){
		// 	this.workers[i] = new Worker('filter/overlay_worker.js');
		// 	this.workers[i].addEventListener('message', function(e){
		// 		overlays[e.data.overlay_id].addChunk(e.chunk_id, e.work);
		// 	}, false);

		// 	var start = i * floor(this.image.height / 8);
		// 	if (i == this.workers.length - 1)
		// 		stop = this.image.height;
		// 	else
		// 		stop = (i + 1) * floor(this.image.height / 8);
		// 	this.workers[i].postMessage({overlay_id: this.id, pixels: this.image.pixels, start: start, stop: stop, chunk_id: i});
		// }
	}

	// this.addChunk = function(id, chunk){
	// 	this.chunks[id] = chunk;
	// 	this.chunks_complete++;
	// 	if (this.chunks_complete == this.workers.length)
	// 		this.consolidateChunks();
	// }

	// this.consolidateChunks = function(){
	// 	var new_pixels = [];
	// 	for (var i = 0; i < this.workers.length; i++)
	// 		new_pixels = concat(new_pixels, chunks[i]);

	// 	this.image.loadPixels();
	// 	for (var i = 0; i < new_pixels.length; i++)
	// 		this.image.pixels[i] = new_pixels[i];
	// 	this.image.updatePixels();
	// }

	this.show = function(){
		push();
			resetMatrix();
			translate((screen_bounds[0] + screen_bounds[1]) / 2, (screen_bounds[2] + screen_bounds[3]) / 2);

			var w, h;
			var image_ratio = this.image.width / this.image.height;
			if (image_ratio >= screen_width / screen_height){
				h = screen_height;
				w = h * image_ratio;
			}
			else{
				w = screen_width;
				h = w * (1/image_ratio);
			}

			imageMode(CENTER);
			image(this.image, 0, 0, w, h);
		pop();
	}
}