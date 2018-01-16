function MenuBarFolder(menu_bar, label){
	this.menu_bar = menu_bar;
	if (this.menu_bar.folders.length > 0)
		this.pos = createVector(this.menu_bar.folders[this.menu_bar.folders.length - 1].bounds[1], 0);
	else
		this.pos = createVector(0, 0);
	this.width = pow(str(label).length, 1/1.5) * 16;
	this.height = this.menu_bar.height;
	this.bounds = [this.pos.x, this.pos.x + this.width, 0, this.height];

	// Default fills
	this.default_fill = this.menu_bar.fill;
	this.text_default_fill = color(0);

	// Highlight fills
	this.highlight_fill = color(6, 104, 213);
	this.text_highlight_fill = color(255);

	// Current fill
	this.fill = this.default_fill;
	this.text_fill = this.text_default_fill;

	// Folder label and button labels
	this.label = label;

	// Indicator for whether folder is open or not
	this.is_open = false;

	// Fill buttons array with button objects
	this.buttons = [];	

	this.addButton = function(b, s, o){
		this.buttons = append(this.buttons, new MenuBarButton(this.menu_bar, this, b, s, o, (this.buttons.length + 1) * this.height));
	}

	// Store button width as the maximum width of all the button labels + shortcuts
	this.initialize = function(){
		var button_width = -1;
		var len;
		for (var i = 0; i < this.buttons.length; i++){
			len = pow(str(this.buttons[i].label + "               " + this.buttons[i].shortcut).length, 1/1.5) * 18;
			if (len > button_width)
				button_width = len;
		}
		for (var i = 0; i < this.buttons.length; i++){
			this.buttons[i].setWidth(button_width);
		}
	}

	this.show = function(){
		push();
			noStroke();
			fill(this.fill);
			rect(this.pos.x, this.pos.y, this.width, this.height);
			textAlign(CENTER, CENTER);
			textFont("Arial");
			translate(this.pos.x + this.width / 2, this.height / 2);
			fill(this.text_fill);
			noStroke();
			if (this.pos.x == 0)
				textStyle(BOLD);
			text(this.label, 0, 0);
			textStyle(NORMAL);
			if (this.is_open){
				this.showButtons(this.open);
				this.showButtonEnclosure();
			}
		pop();
	}

	this.setFill = function(f){
		this.fill = f;
	}

	this.setTextFill = function(f){
		this.text_fill = f;
	}

	this.highlight = function(){
		this.setFill(this.highlight_fill);
		this.setTextFill(this.text_highlight_fill);
	}

	this.unhighlight = function(){
		this.setFill(this.default_fill);
		this.setTextFill(this.text_default_fill);
	}

	this.showButtons = function(){
		for (var i = 0; i < this.buttons.length; i++)
			this.buttons[i].show();
	}

	this.showButtonEnclosure = function(){
		push();
			resetMatrix();
			noFill();
			stroke(51);
			rect(this.pos.x, this.pos.y + this.height + 1, this.buttons[0].width, this.buttons.length * (this.buttons[0].height - 1.65), 0, 0, 5, 5);
		pop();
	}

	this.open = function(){
		this.is_open = true;
		this.highlight();
	}

	this.close = function(){
		this.is_open = false;
		this.unhighlight();
	}

	this.clicked = function(){
		return this.menu_bar.withinBounds(mouseX, mouseY, this.bounds);
	}

	this.mouseOver = function(){
		return this.clicked();
	}
}