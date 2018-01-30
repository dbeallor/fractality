function FilterBrowser(){
	this.overlays = [];
	this.tiles = [];
	this.num_overlays = 15;
	this.overlay_images = [];
	var d = pixelDensity();
	this.graphic = createGraphics(d * (windowWidth * 0.15 + 1), d * windowHeight);
	this.bounds = [0, windowWidth * 0.15, menu_bar.height, windowHeight];
	this.visible = false;
	this.above_fractal = false;	
	this.opacity = 0.5;
	this.opacity_changed = false;
	this.drawer_handle = new DrawerHandle();
	this.page = 0;
	this.buttons = [];
	this.scroll_ready = true;

	this.initialize = function(){
		for (var i = 0; i < this.overlay_images.length; i++){
			this.overlays[i] = new Overlay(this.overlay_images[i], i);
			this.overlays[i].initialize();
		}

		for (var i = 0; i < this.overlays.length; i++){
			this.tiles[i] = new FilterTile(i, this.overlay_images[i]);
			this.tiles[i].initialize();
		}

		this.buttons[0] = new p5Button("↑", this.bounds[0] + 20, this.bounds[2] + 20, 20, 20, function(){
			filter_browser.page = filter_browser.page - 1;
			if (filter_browser.page < 0)
				filter_browser.page = ceil(filter_browser.num_overlays / 5) - 1;
		});
		this.buttons[0].setTextSize(16);
		// this.buttons[0].setFill(255);
		this.buttons[1] = new p5Button("↓", this.bounds[0] + 20, this.bounds[3] - 20, 20, 20, function(){
			filter_browser.page = (filter_browser.page + 1) % ceil(filter_browser.num_overlays / 5);
		});
		this.buttons[1].setTextSize(16);
		// this.buttons[1].setFill(255);
	}

	this.show = function(){
		for (var i = 0; i < this.tiles.length; i++){
			this.tiles[i].show();
			if (this.visible && this.tiles[i].selected && filter_browser.page == floor(this.tiles[i].id / 5))
				this.tiles[i].showElements();
			else
				this.tiles[i].hideElements();
		}

		if (this.visible){
			var d = pixelDensity();
			image(this.graphic, 0, 0, this.graphic.width / d, this.graphic.height / d);
			this.buttons[0].show();
			this.buttons[1].show();
		}

		this.drawer_handle.show();
	}

	this.resize = function(){
		this.graphic = createGraphics(d * (windowWidth * 0.15 + 1), d * windowHeight);
		this.bounds = [0, windowWidth * 0.15, menu_bar.height, windowHeight];

		if (this.visible){
			screen_bounds = [windowWidth * 0.15, windowWidth, menu_bar.height, windowHeight];
			screen_width = screen_bounds[1] - screen_bounds[0];
			screen_height = screen_bounds[3] - screen_bounds[2];
			center = [windowWidth * 0.15 + screen_width / 2, menu_bar.height + screen_height / 2];
		}

		for (var i = 0; i < this.tiles.length; i++){
			this.tiles[i].initialize();
			if (this.tiles[i].selected && this.visible)
				this.tiles[i].showElements();
		}

		this.drawer_handle.resize();

		this.buttons[0] = new p5Button("↑", this.bounds[0] + 20, this.bounds[2] + 20, 20, 20, function(){
			filter_browser.page = filter_browser.page - 1;
			if (filter_browser.page < 0)
				filter_browser.page = ceil(filter_browser.num_overlays / 5) - 1;
		});
		this.buttons[0].setTextSize(16);
		// this.buttons[0].setFill(255);
		this.buttons[1] = new p5Button("↓", this.bounds[0] + 20, this.bounds[3] - 20, 20, 20, function(){
			filter_browser.page = (filter_browser.page + 1) % ceil(filter_browser.num_overlays / 5);
		});
		this.buttons[1].setTextSize(16);
		// this.buttons[1].setFill(255);
		if (this.visible){
			this.buttons[0].open();
			this.buttons[1].open();
		}
	}

	this.onClick = function(){
		if (this.visible && menu_bar.folderIsOpen() < 0 && noOpenWindows()){
			this.buttons[0].onClick(true);
			this.buttons[1].onClick(true);
			for (var i = 0; i < 5; i++){
				if (!withinBounds(mouseX, mouseY, this.buttons[0].bounds))
					if (!withinBounds(mouseX, mouseY, this.buttons[1].bounds))
						this.tiles[this.page * 5 + i].onClick();
			}
		}

		this.drawer_handle.onClick();
	}

	this.onKeyPress = function(){
		if (keyCode == ESCAPE && this.visible)
			toggleFilterBrowser();
	}

	this.mouseWheel = function(delta){
		if (withinBounds(mouseX, mouseY, this.bounds) && noOpenWindows() && menu_bar.folderIsOpen() < 0){
			if (delta < 0){
				filter_browser.page = filter_browser.page - 1;
				if (filter_browser.page < 0)
					filter_browser.page = ceil(filter_browser.num_overlays / 5) - 1;
			}
			else
				filter_browser.page = (filter_browser.page + 1) % ceil(filter_browser.num_overlays / 5);
		}
	}

	this.open = function(){
		this.visible = true;

		screen_bounds = [windowWidth * 0.15, windowWidth, menu_bar.height, windowHeight];
		screen_width = screen_bounds[1] - screen_bounds[0];
		screen_height = screen_bounds[3] - screen_bounds[2];
		center = [windowWidth * 0.15 + screen_width / 2, menu_bar.height + screen_height / 2];

		grid.pos.set(center[0], center[1]);

		var dims = galleryDims();
		windows[5].resize(dims[0], dims[1]);
		windows[6].resize();
		for (var i = 0; i < windows.length; i++)
			windows[i].setPosition(center[0], center[1]);

		for (var i = 0; i < this.tiles.length; i++)
			if (this.tiles[i].selected)
				this.tiles[i].showElements();

		this.buttons[0].open();
		this.buttons[1].open();

		this.drawer_handle.resize();
	}

	this.close = function(){
		this.visible = false;

		screen_bounds = [0, width, menu_bar.height, height];
		screen_width = screen_bounds[1] - screen_bounds[0];
		screen_height = screen_bounds[3] - screen_bounds[2];
		center = [windowWidth / 2, (windowHeight - menu_bar.height) / 2 + menu_bar.height];

		grid.pos.set(center[0], center[1]);

		var dims = galleryDims();
		windows[5].resize(dims[0], dims[1]);
		windows[6].resize();
		for (var i = 0; i < windows.length; i++)
			windows[i].setPosition(center[0], center[1]);

		this.buttons[0].close();
		this.buttons[1].close();

		this.drawer_handle.resize();

		for (var i = 0; i < this.tiles.length; i++)
			this.tiles[i].hideElements();
	}

	this.deselectAll = function(id){
		for (var i = 0; i < this.tiles.length; i++){
			if (this.tiles[i].selected && i != id){
				this.tiles[i].selected = false;
				this.tiles[i].hideElements();
				this.opacity = 0.5;
				this.overlays[i].initialize();
			}
		}
	}

	this.aboveFractal = function(){
		this.above_fractal = true;
	}

	this.belowFractal = function(){
		this.above_fractal = false;
	}
}