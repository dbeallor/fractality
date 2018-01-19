function LoadingAnimation(){
	this.angle = 0;
	this.dot_counter = 0;
	this.max = 100;
	this.dots = "";

	this.show = function(){
		push();
			var d = pixelDensity();
			var y_dim = windowHeight;
			var x_dim = (loading_image.width * y_dim) / loading_image.height;
			imageMode(CENTER);
			image(loading_image, windowWidth / 2, windowHeight / 2, x_dim, y_dim);

			resetMatrix();
			translate(windowWidth / 2, windowHeight / 2 + windowHeight * 0.13);
			rotate(this.angle);
			imageMode(CENTER);
			image(load_icon, 0, 0, windowHeight * 0.25, windowHeight * 0.25);
			this.angle += 0.04;

			fill(255);
			this.dot_counter = ((this.dot_counter + 1) % this.max);
			if (this.dot_counter == 0)
				this.dots = "";
			if (this.dot_counter == this.max / 4 - 1)
				this.dots = ".";
			if (this.dot_counter == this.max / 2 - 1)
				this.dots = "..";
			if (this.dot_counter == 3 * this.max / 4 - 1)
				this.dots = "...";

			resetMatrix();
			textAlign(CENTER, CENTER);
			text("Loading" + this.dots, windowWidth / 2, windowHeight / 2 + windowHeight * 0.29);
		pop();
	}
}