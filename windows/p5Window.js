function p5Window(title, x, y, width, height){
	this.pos = createVector(x, y);
	this.title = title;
	this.width = width;
	this.height = height;
	this.fill = color(255);
	this.accent = color(220);
	this.header_height = constrain(this.height * 0.15, 20, 30);
	this.bounds = [this.pos.x - this.width / 2, this.pos.x + this.width / 2, this.pos.y - this.height / 2, this.pos.y + this.height / 2];
	this.exit_button = new ExitButton(this.pos.x + this.width / 2 - this.header_height / 2, this.pos.y - this.height / 2 + this.header_height / 2);
	this.visible = false;
	this.buttons = [];
	this.text = "";
	this.text_style = BOLD;
	this.text_size = 12;
	this.text_position = createVector(0, (-this.height / 2 + this.header_height)/2);
	this.image = image || createImage(this.width, this.height);
	this.exitable = true;

	this.show = function(){
		if (this.visible){
			push();
				resetMatrix();
				translate(this.pos.x, this.pos.y);
				rectMode(CENTER);
				fill(this.accent);
				rect(0, -this.height / 2 + this.header_height / 2, this.width, this.header_height, 5, 5, 0, 0);
				fill(0);
				noStroke();
				textFont("Arial");
				textStyle(BOLD);
				textAlign(CENTER, CENTER);
				if (this.header_height > 38 )
					textSize(14);
				else
					textSize(12);
				text(this.title, 0, -this.height / 2 + this.header_height / 2 + 1);
				stroke(0);
				fill(this.fill);
				rect(0, 0, this.width, this.height - 2 * this.header_height);
				fill(this.accent);
				rect(0, this.height / 2 - this.header_height / 2, this.width, this.header_height, 0, 0, 5, 5);
				if (this.exitable)
					this.exit_button.show();
				fill(0);
				noStroke();
				textSize(this.text_size);
				textStyle(this.text_style);
				text(this.text, this.text_position.x, this.text_position.y);
			pop();
			this.showButtons();
		}
	}

	this.showButtons = function(){
		if (this.buttons.length > 0){
			for (var i = 0; i < this.buttons.length; i++)
				this.buttons[i].show();
		}
	}

	this.onClick = function(){
		if (this.exitable && this.exit_button.clicked()){
			this.close();
			return true;
		}
		if (this.buttons.length > 0){
			for (var i = 0; i < this.buttons.length; i++)
				this.buttons[i].onClick();
		}
		return false;
	}

	this.open = function(){
		this.visible = true;
		this.openButtons();
	}

	this.close = function(){
		this.visible = false;
		this.closeButtons();
	}

	this.openButtons = function(){
		if (this.buttons.length > 0){
			for (var i = 0; i < this.buttons.length; i++)
				this.buttons[i].open();
		}
	}

	this.closeButtons = function(){
		if (this.buttons.length > 0){
			for (var i = 0; i < this.buttons.length; i++)
				this.buttons[i].close();
		}
	}

	this.withinBounds = function(x, y, bounds){
		return (x >= bounds[0] && x <= bounds[1] && y >= bounds[2] && y <= bounds[3]);
	}

	this.addButton = function(label, x, y, width, height, listener){
		this.buttons = append(this.buttons, new p5Button(label, x, y, width, height, listener));
	}

	this.setText = function(t){
		this.text = t;
	}

	this.setTextStyle = function(ts){
		this.text_style = ts;
	}

	this.setTextSize = function(ts){
		this.text_size = ts;
	}

	this.setTextPosition = function(x, y){
		this.text_position.set(x, y);
	}

	this.setPosition = function(x, y){
		this.pos.set(x, y);
	}

	this.addImage = function(){
		this.image = image;
	}
}