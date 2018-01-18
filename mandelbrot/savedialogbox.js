function SaveDialogBox(title, x, y, width, height, file_type, save_listener, file_name_listener){
	this.pos = createVector(x, y);
	this.title = title;
	this.width = width;
	this.height = height;
	this.bounds = [this.pos.x - this.width / 2, this.pos.x + this.width / 2, this.pos.y - this.height / 2, this.pos.y + this.height / 2];
	this.window = new p5Window(this.title, this.pos.x, this.pos.y, this.width, this.height);
	this.text_input;
	this.file_name = '';
	this.file_type = file_type;
	this.save_listener = save_listener;
	this.file_name_listener = file_name_listener;
	this.save_button;
	this.visible = false;

	this.initialize = function(){
		this.text_input = createInput('enter filename');
		this.text_input.size(125, 20);
		this.text_input.position(this.pos.x - 95, this.pos.y - 9);
		this.text_input.input(this.file_name_listener);
		this.text_input.style('z-index', "1");
		this.text_input.hide();

		this.save_button = createButton('save');
		this.save_button.position(this.pos.x + 63, this.pos.y - 9);
		this.save_button.mousePressed(this.save_listener);
		this.save_button.style('z-index', "1");
		this.save_button.size(40, 20);
		this.save_button.hide();
	}

	this.show = function(){
		if (this.visible){
			this.window.show();
			push();
				fill(0);
				noStroke();
				textFont("Arial");
				textAlign(LEFT, CENTER);
				text(this.file_type, this.pos.x + 32, this.pos.y + 1);
			pop();
		}
	}

	this.open = function(){
		this.text_input.show();
		this.save_button.show();
		this.window.open();
		this.visible = true;
	}

	this.close = function(){
		this.text_input.hide();
		this.save_button.hide();
		this.window.close();
		this.visible = false;
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

	this.setFileName = function(x){
		this.text_input.attribute("value", x);
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
		this.text_input.position(this.pos.x - 95, this.pos.y - 9);
		this.save_button.position(this.pos.x + 63, this.pos.y - 9);
		if (was_open)
			this.open();
	}
}