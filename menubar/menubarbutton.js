function MenuBarButton(menu_bar, folder, label, shortcut, onClick, y){
	this.menu_bar = menu_bar;
	this.folder = folder;
	this.label = label;
	this.shortcut = shortcut;
	this.pos = createVector(folder.pos.x, y + 1);
	this.width;
	this.height = menu_bar.height + 2;
	this.text_size = 12;
	this.bounds;
	this.fill = folder.default_fill;
	this.disabled_text_fill = color(150);
	this.text_fill = this.disabled_text_fill;
	this.enabled = false;
	this.onClick = onClick;
	this.checked = false;

	this.setWidth = function(w){
		this.width = w;
		this.bounds = [this.pos.x, this.pos.x + this.width, this.pos.y + 2, this.pos.y + this.height - 2];
	}

	this.show = function(){
		push();
			textSize(12);
			this.mouseOver() ? this.highlight() : this.unhighlight();
			resetMatrix();
			fill(this.fill);
			noStroke();
			if (this.label == this.folder.buttons[this.folder.buttons.length - 1].label)
				rect(this.pos.x, this.pos.y, this.width, this.height, 0, 0, 5, 5);
			else
				rect(this.pos.x, this.pos.y, this.width, this.height);
			fill(this.text_fill);
			noStroke();
			textAlign(LEFT, CENTER);
			textFont("Arial");
			text(this.label, this.pos.x + 20, this.pos.y + this.height / 2);
			if (this.enabled){
				textAlign(RIGHT, CENTER);
				text(this.shortcut, this.pos.x + this.width - 15, this.pos.y + this.height / 2);
				if (this.checked){
					stroke(this.text_fill);
					strokeWeight(2);
					line(this.pos.x + 6, this.pos.y + this.height / 2, this.pos.x + 9, this.pos.y + this.height - 8);
					line(this.pos.x + 9, this.pos.y + this.height - 8, this.pos.x + 14, this.pos.y + 7);
				}
			}
		pop();
	}

	this.setTextSize = function(s){
		this.text_size = s;
	}

	this.setFont = function(f){
		this.font = f;
	}

	this.setFill = function(f){
		this.fill = f;
	}

	this.setTextFill = function(f){
		this.text_fill = f;
	}

	this.highlight = function(){
		if (this.enabled){
			this.setFill(this.folder.highlight_fill);
			this.setTextFill(this.folder.text_highlight_fill);
		}
	}

	this.unhighlight = function(){
		if (this.enabled){
			this.setFill(this.folder.default_fill);
			this.setTextFill(this.folder.text_default_fill);
		}
	}

	this.clicked = function(){
		return this.menu_bar.withinBounds(mouseX, mouseY, this.bounds);
	}

	this.mouseOver = function(){
		return this.clicked();
	}

	this.enable = function(){
		this.enabled = true;
	}

	this.disable = function(){
		this.enabled = false;
		this.setTextFill(this.disabled_text_fill);
	}

	this.shortcutPressed = function(){
		if (this.specialCharacter(this.shortcut)){
			var code = this.tokenToKeyCode(this.shortcut);
			return (keyCode == code);
		}
		else
			return (key == this.shortcut);
	}

	this.tokenToKeyCode = function(token){
		switch(token){
			case "space" : return 32; break;
			case "enter" : return ENTER; break;
			case "+" : return 187; break;
			case "-" : return 189; break;
			case "?" : return 191; break;	
			case ";" : return 186; break;
		}
	}

	this.specialCharacter = function(token){
		var chars = ["space", "enter", "+", "-", "?", ";"];
		return (chars.indexOf(token) > -1);
	}

	this.check = function(){
		this.checked = true;
	}

	this.uncheck = function(){
		this.checked = false;
	}
}