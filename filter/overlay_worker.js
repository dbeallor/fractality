self.addEventListener('message', function(e){
	var new_pixels = [];
	for (var i = e.data.start; i < e.data.stop; i++){
		if (i % 4 == 3)
			new_pixels.push(e.opacity);
		else
			new_pixels.push(e.pixels[i]);
	}
	self.postMessage({work: new_pixels, chunk_id: e.data.chunk_id, overlay_id: e.data.overlay_id});
}, false);