function DrawerHandle(){
	this.width = windowWidth * 0.015;
	this.height = windowHeight * 0.06;
	this.bounds = [screen_bounds[0], screen_bounds[0] + this.width, center[1] - this.height / 2, center[1] + this.height / 2];
	this.visible = false;

	this.show = function(){
		if (this.visible){
			push();
				resetMatrix();
				fill(220);
				noStroke();
				rect(screen_bounds[0], screen_bounds[2] + screen_height / 2 - this.height / 2, this.width, this.height, 0, 10, 10, 0);
				stroke(0);
				strokeWeight(3);
				var offset = windowWidth * 0.0055;
				if (filter_browser.visible){
					line(screen_bounds[0] + this.width - offset, center[1] - this.height / 2 + offset * 1.7, screen_bounds[0] + offset, center[1]);
					line(screen_bounds[0] + offset, center[1], screen_bounds[0] + this.width - offset, center[1] + this.height / 2 - offset * 1.7);
				}
				else {
					line(screen_bounds[0] + offset, center[1] - this.height / 2 + offset * 1.7, screen_bounds[0] + this.width - offset, center[1]);
					line(screen_bounds[0] + this.width - offset, center[1], screen_bounds[0] + offset, center[1] + this.height / 2 - offset * 1.7);
				}

			pop();

			if (withinBounds(mouseX, mouseY, this.bounds))
				canvas.style.cursor = 'pointer';
		}	
	}

	this.resize = function(){
		this.width = windowWidth * 0.015;
		this.height = windowHeight * 0.06;
		this.bounds = [screen_bounds[0], screen_bounds[0] + this.width, center[1] - this.height / 2, center[1] + this.height / 2]
	}

	this.makeVisible = function(){
		this.visible = true;
	}

	this.hide = function(){
		this.visible = false;
	}

	this.onClick = function(){
		if (withinBounds(mouseX, mouseY, this.bounds)){
			toggleFilterBrowser();
			this.resize();
		}
	}
}