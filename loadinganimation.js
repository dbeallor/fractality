function LoadingAnimation(){
	this.angle = 0;
	this.dot_counter = 0;
	this.max = 100;
	this.dots = "...";

	this.show = function(){
		background(0);
		this.loadingAnimatedDots();	
	}

	this.loadingAnimatedDots = function(){
		push();
			resetMatrix();
			textAlign(CENTER, CENTER);
			fill(255);
			noStroke();
			textFont("Arial");
			textSize(64);
			text("Fractality", windowWidth / 2, windowHeight / 2);
			textSize(24);
			text("Loading" + this.dots, windowWidth / 2, windowHeight / 2 + windowHeight * 0.29);
			this.dot_counter = ((this.dot_counter + 1) % this.max);
			if (this.dot_counter == 0)
				this.dots = "...";
			if (this.dot_counter == this.max / 4 - 1)
				this.dots = "";
			if (this.dot_counter == this.max / 2 - 1)
				this.dots = ".";	
			if (this.dot_counter == 3 * this.max / 4 - 1)
				this.dots = "..";
		pop();
	}
}