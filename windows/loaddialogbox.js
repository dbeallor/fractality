function LoadDialogBox(title, x, y, width, height, fileHandler, dragOverListener, dragLeaveListener){
	this.pos = createVector(x, y);
	this.title = title;
	this.width = width;
	this.height = height;
	this.bounds = [this.pos.x - this.width / 2, this.pos.x + this.width / 2, this.pos.y - this.height / 2, this.pos.y + this.height / 2];
	this.window = new p5Window(this.title, this.pos.x, this.pos.y, this.width, this.height);
	this.visible = false;
	this.upload_button;
	this.drop_area;
	this.fileHandler = fileHandler;
	this.dragOverListener = dragOverListener;
	this.dragLeaveListener = dragLeaveListener;

	this.initialize = function(){
		this.upload_button = createFileInput(fileHandler);
		this.upload_button.style("z-index", "1");
		this.upload_button.position(this.pos.x - 65, this.pos.y + 3);
		this.upload_button.hide();
		this.upload_button.size(170, 20);

		this.drop_area = createP('');
		this.drop_area.position(0, 5);
		this.drop_area.size(screen_bounds[1] - screen_bounds[0], screen_bounds[3] - screen_bounds[2]);
		this.drop_area.dragOver(this.dragOverListener);
		this.drop_area.dragLeave(this.dragLeaveListener);
		this.drop_area.drop(this.fileHandler);
		this.drop_area.style("z-index", "0")
		this.drop_area.style("border", "none");
		this.drop_area.style("font-family", "Verdana");
		this.drop_area.style("alpha", "210");
		this.drop_area.hide();
	}

	this.show = function(){
		if (this.visible){
			this.window.show();
			push();
				resetMatrix();
				translate(this.pos.x, this.pos.y);
				fill(0);
				noStroke();
				textFont("Arial");
				textStyle(BOLD);
				textSize(16);
				textAlign(CENTER, CENTER);
				text("Drag and Drop Your File", 0, -15);
				textStyle(NORMAL);
				textSize(12);
				textAlign(LEFT, TOP);
				text("or", -85, 5);
			pop();
		}
	}

	this.open = function(){
		this.visible = true;
		this.window.open();
		this.upload_button.show();
		this.drop_area.show();
	}

	this.close = function(){
		this.visible = false;
		this.window.close();
		this.upload_button.hide();
		this.drop_area.hide();
	}

	this.onClick = function(){
		if (this.visible){
			if (this.window.onClick()){
				this.close();
				return true;
			}
		}
		return false;
	}

	this.onKeyPress = function(){
		if (this.visible){
			if (keyCode == ESCAPE)
				this.close();
		}
	}

	this.setPosition = function(x, y){
		var was_open = this.visible;
		this.pos.set(x, y);
		this.bounds = [this.pos.x - this.width / 2, this.pos.x + this.width / 2, this.pos.y - this.height / 2, this.pos.y + this.height / 2];
		this.window = new p5Window(this.title, this.pos.x, this.pos.y, this.width, this.height);
		this.upload_button.position(this.pos.x - 65, this.pos.y + 3);
		this.drop_area.position(0, 5);
		this.drop_area.size(screen_bounds[1] - screen_bounds[0], screen_bounds[3] - screen_bounds[2]);
		if (was_open)
			this.open();
	}
}