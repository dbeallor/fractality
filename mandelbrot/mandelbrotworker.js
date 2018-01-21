self.addEventListener('message', function(e){
	// =======================================================================================================
	// ==FUNCTIONS
	// =======================================================================================================
	function mandelbrot(z, c, ctr, i) {
		if (ctr == i) return 0;
		if (z[0]*z[0] + z[1]*z[1] > 4) 
			return Math.pow(map(ctr, 0, i, 0, 1), 1/2);
		return mandelbrot(c_add(c_square(z), c), c, ctr + 1, i);
	}

	function map(n, start1, stop1, start2, stop2) {
	  	return ((n-start1)/(stop1-start1))*(stop2-start2)+start2;
	}

	function c_add(a, b){
	//Component-wise addition of complex numbers a and b
	return [a[0] + b[0], a[1] + b[1]];
	}

	function c_square(z){
		// z^2 = (a + ib)^2 = (a^2 - b^2) + (2ab)*i 
		return [z[0]*z[0] - z[1]*z[1], 2*z[0]*z[1]];
	}

	function colorMap(x){
		if (x == 0)
			return [0, 0, 0, 0];
		return lerpColor(e.data.c1, e.data.c2, x);
	}

	function lerpColor(c1, c2, amt) {
		var l0, l1, l2, a;
		var fromArray, toArray;

		// console.log(c1);
		fromArray = c1.hsba;
		toArray = c2.hsba;

		// Prevent extrapolation.
		amt = Math.max(Math.min(amt, 1), 0);

		// Perform interpolation.
		l0 = lerp(fromArray[0], toArray[0], amt);
		l1 = lerp(fromArray[1], toArray[1], amt);
		l2 = lerp(fromArray[2], toArray[2], amt);
		a = 1;

		c = hsbaToRGBA([l0, l1, l2, a]);

		return ([c[0] * 255, c[1] * 255, c[2] * 255, c[3] * 255]);
	}

	function lerp(start, stop, amt) {
	  return amt*(stop-start)+start;
	}

	function hsbaToRGBA(hsba) {
	  var hue = hsba[0] * 6;  // We will split hue into 6 sectors.
	  var sat = hsba[1];
	  var val = hsba[2];

	  var RGBA = [];

	  if (sat === 0) {
	    RGBA = [val, val, val, hsba[3]];  // Return early if grayscale.
	  } else {
	    var sector = Math.floor(hue);
	    var tint1 = val * (1 - sat);
	    var tint2 = val * (1 - sat * (hue - sector));
	    var tint3 = val * (1 - sat * (1 + sector - hue));
	    var red, green, blue;
	    if (sector === 1) {  // Yellow to green.
	      red = tint2;
	      green = val;
	      blue = tint1;
	    } else if (sector === 2) {  // Green to cyan.
	      red = tint1;
	      green = val;
	      blue = tint3;
	    } else if (sector === 3) {  // Cyan to blue.
	      red = tint1;
	      green = tint2;
	      blue = val;
	    } else if (sector === 4) {  // Blue to magenta.
	      red = tint3;
	      green = tint1;
	      blue = val;
	    } else if (sector === 5) {  // Magenta to red.
	      red = val;
	      green = tint1;
	      blue = tint2;
	    } else {  // Red to yellow (sector could be 0 or 6).
	      red = val;
	      green = tint3;
	      blue = tint1;
	    }
	    RGBA = [red, green, blue, hsba[3]];
	  }

	  return RGBA;
	};

	// =======================================================================================================
	// ==TASK
	// =======================================================================================================
	var w = e.data.width;
	var h = e.data.height;
	var a, b, f;
	var work = [];
	for (var j = e.data.start; j < e.data.stop; j++){
		for (var i = 0; i < w; i++){
			a = map(i, 0, w - 1, e.data.x_range[0],  e.data.x_range[1]);
			b = map(j, 0, h - 1, e.data.y_range[0],  e.data.y_range[1]);
			f = colorMap(mandelbrot([0, 0], [a, b], 0, e.data.iterations));
			work.push(f[0]);
			work.push(f[1]);
			work.push(f[2]);
			work.push(f[3]);
		}
	}

	self.postMessage({work: work, start: e.data.start, stop: e.data.stop, chunk: e.data.chunk});
}, false);