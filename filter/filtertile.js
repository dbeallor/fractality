function FilterTile(id, img){
	this.id = id;
	this.image = img;
	this.selected = false;
	this.opacity_slider = createSlider(0.3, 0.75, 0.5, 0);
	this.checkbox = createCheckbox('', false);
	
	this.initialize = function(){
		this.width = windowWidth * 0.15;
		this.height = screen_height / min(filter_browser.num_overlays, 5);
		this.y = menu_bar.height + this.height * (this.id % 5);
		
		var w = floor(this.width * 0.33);
		this.opacity_slider.style('width', w + 'px');
		this.opacity_slider.position(this.width / 2 - this.width * 0.05, this.y + this.height / 2 - this.height * 0.15);
		this.opacity_slider.style('visibility', 'hidden');
		this.opacity_slider.changed(function(){
			filter_browser.opacity = this.value();
			filter_browser.opacity_changed = true;
		});

		this.checkbox.changed(function() {
			if (this.checked())
				filter_browser.aboveFractal();
			else
				filter_browser.belowFractal();
		});
		this.checkbox.position(this.width / 2 + this.width * 0.2, this.y + this.height / 2 + this.height * 0.1);
		this.checkbox.style('visibility', 'hidden');
	}

	this.show = function(){
		if (filter_browser.visible && filter_browser.page == floor(this.id / 5)){
			push();
				var g = filter_browser.graphic;
				g.resetMatrix();
				g.fill(0);
				g.stroke(220);
				g.rectMode(CORNER);
				g.rect(0, this.y, this.width, this.height);

				g.imageMode(CORNER);
				var ratio = this.image.width / this.image.height;
				if (ratio > this.width / this.height){
					var ww = this.height * ratio;
					g.image(this.image, 0, this.y, ww, this.height);
				}
				else{
					var hh = this.width * (1/ratio);
					g.image(this.image, 0, this.y, this.width, hh);
				}
				g.noFill();
				g.stroke(255);
				g.rectMode(CORNER);
				g.rect(0, this.y, this.width, this.height);

				if (this.selected){
					this.showXIcon();
					if (withinBounds(mouseX, mouseY, [5.3 * this.width / 6 - this.width * 0.15 / 2, 5.3 * this.width / 6 + this.width * 0.15 / 2, this.y + this.height / 6 - this.width * 0.15 / 2, this.y + this.height / 6 + this.width * 0.15 / 2]))
						canvas.style.cursor = 'pointer';
					
					this.showElementLabels();
				}
				else if (withinBounds(mouseX, mouseY, [0, this.width, this.y, this.y+this.height]) && menu_bar.folderIsOpen() < 0 && noOpenWindows()){
					if (!withinBounds(mouseX, mouseY, filter_browser.buttons[0].bounds)){
						if (!withinBounds(mouseX, mouseY, filter_browser.buttons[1].bounds)){
							this.showCheckIcon();
							canvas.style.cursor = 'pointer';
						}
					}
				}
			pop();
		}
		if (this.selected){
			if (filter_browser.opacity_changed){
				filter_browser.overlays[this.id].initialize();
				filter_browser.opacity_changed = false;
			}
			filter_browser.overlays[id].show();
			if (!filter_browser.above_fractal)
				fractal.show();
		}
	}

	this.onClick = function(){
		if (withinBounds(mouseX, mouseY, [0, this.width, this.y, this.y+this.height]) && menu_bar.folderIsOpen() < 0 && noOpenWindows()){
			if (this.selected && withinBounds(mouseX, mouseY, [5.3 * this.width / 6 - this.width * 0.15 / 2, 5.3 * this.width / 6 + this.width * 0.15 / 2, this.y + this.height / 6 - this.width * 0.15 / 2, this.y + this.height / 6 + this.width * 0.15 / 2])){
				this.selected = false;
				this.hideElements();
				filter_browser.opacity = 0.5;
				filter_browser.overlays[this.id].initialize();
			}
			else if (!this.selected){
				this.selected = true;
				this.showElements();
				if (this.checkbox.checked())
					filter_browser.above_fractal = true;
				else
					filter_browser.above_fractal = false;

				filter_browser.opacity = this.opacity_slider.value();
				filter_browser.overlays[this.id].initialize();
			}
			filter_browser.deselectAll(this.id);
		}
	}

	this.showElements = function(){
		this.opacity_slider.style('visibility', 'visible');
		this.checkbox.style('visibility', 'visible');
	}

	this.hideElements = function(){
		this.opacity_slider.style('visibility', 'hidden');
		this.checkbox.style('visibility', 'hidden');
	}

	this.showElementLabels = function(){
		var g = filter_browser.graphic;
		g.push();
			g.fill(255);
			g.noStroke();
			g.textSize(12);
			g.textFont("Arial");
			g.textAlign(CENTER, CENTER);
			g.text("Opacity", this.width / 2 - this.width * 0.2, this.y + this.height / 2 - pow(this.height * 0.05, 1.3));
			g.text("Above Fractal?", this.width / 2 - this.width * 0.1, this.y + this.height / 2 + pow(this.height * 0.075, 1.3));
		g.pop();
	}

	this.showXIcon = function(){
		var g = filter_browser.graphic;
		g.push();
			g.fill(220);
			g.noStroke();
			g.translate(5.3 * this.width / 6, this.y + this.height / 6);
			g.ellipse(0, 0, this.width * 0.1, this.width * 0.1);
			g.rotate(Math.PI / 4);
			g.stroke(0);
			g.strokeWeight(2);
			g.line(0, - this.width * 0.03, 0, this.width * 0.03);
			g.line(-this.width * 0.03, 0, this.width * 0.03, 0);
		g.pop();
	}

	this.showCheckIcon = function(){
		var g = filter_browser.graphic;
		g.push();
			g.resetMatrix();
			g.fill(220);
			g.noStroke();
			g.ellipse(this.width / 2, this.y + this.height / 2, this.width * 0.2);
			g.stroke(0);
			g.strokeWeight(3);
			g.line(this.width / 2 - this.width * 0.05, this.y + this.height / 2, this.width / 2 - this.width * 0.015, this.y + this.height / 2 + this.height * 0.065);
			g.line(this.width / 2 - this.width * 0.015, this.y + this.height / 2 + this.height * 0.065, this.width / 2 + this.width * 0.035, this.y + this.height / 2 - this.height * 0.065);
		g.pop();
	}
}