function FilterBrowser(){
	this.overlays = [];
	this.num_overlays = 3;
	this.overlay_images = [];

	this.initialize = function(){
		for (var i = 0; i < this.overlays.length; i++)
			this.overlays[i].initialize();
	}

	this.show = function(){
		push();
			fill(180);
			noStroke();
			rect(0, menu_bar.height, windowWidth * 0.15, screen_height);
		pop();
	}


}