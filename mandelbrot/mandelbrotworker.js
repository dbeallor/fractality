self.addEventListener('message', function(e){
	var work = []
	for (var i = e.data.start; i < e.data.stop; i++){
		work[i] = []
		for (var j = 0; j < e.data.height; j++){
			var a = map(i, 0, e.data.width - 1, e.data.left, e.data.right);
			var b = map(j, 0, e.data.height - 1, e.data.top,  e.data.bottom);
			work[i][j] = mandelbrot([0, 0], [a, b], 0, e.data.iterations);
		}
	}
	
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

	self.postMessage({work: work, start: e.data.start, stop: e.data.stop});
}, false);