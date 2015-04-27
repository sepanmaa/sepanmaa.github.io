var Fraktaali = (function () {

    var Complex = function(real, imag) {
	this.real = real;
	this.imag = imag;
    }

    Complex.prototype.mult = function(other) {
	var r = this.real * other.real - this.imag * other.imag;
	var i = this.real * other.imag + this.imag * other.real;
	return new Complex(r, i);
    }

    Complex.prototype.add = function(other) {
	return new Complex(this.real + other.real, this.imag + other.imag);
    }

    Complex.prototype.abs = function() {
	return Math.sqrt(this.real * this.real + this.imag * this.imag);
    }

    Complex.prototype.toString = function() {
	return this.real + " + " + this.imag + "i";
    }

    var Fractal = function(size, iterations, rx, ry, area) {
    	this.size = size;
    	this.iterations = iterations;
	this.rx = rx;
	this.ry = ry;
    	this.area = area;
	this.pixels = null;
	this.getC = function (x, y) { return new Complex(x, y) }
	this.getZ = function (x, y) { return new Complex(x, y) }
	this.updatePixels = function() {
	    this.pixels = fractal(this.size, this.iterations,
				  this.rx, this.ry, this.area,
				  this.getC, this.getZ, this.pixels);
	}
    }

    function Mandelbrot(size, iterations, rx, ry, area) {
	Fractal.call(this, size, iterations, rx, ry, area);
	this.getZ = function (x, y) { return new Complex(0, 0); }
    }

    Mandelbrot.prototype = Object.create(Fractal.prototype);
    Mandelbrot.prototype.constructor = Mandelbrot;

    function Julia(size, iterations, rx, ry, area, cr, ci) {
	Fractal.call(this, size, iterations, rx, ry, area);
	this.cr = cr;
	this.ci = ci;
     	this.getC = function (x, y) { return new Complex(cr, ci); }
    }

    Julia.prototype = Object.create(Fractal.prototype);
    Julia.prototype.constructor = Julia;

    Fractal.prototype.getPixels = function() {
	this.updatePixels();
	return this.pixels;
    }

    Fractal.prototype.setPixels = function(pixels) {
	if (pixels == null)
	    this.updatePixels();
	else
	    this.pixels = pixels;
    }

    Fractal.prototype.centerAt = function(x, y) {
	var scale = this.area / this.size;
	this.rx = this.rx + x * scale;
	this.ry = this.ry + y * scale;
	this.rx = this.rx - this.area / 2;
	this.ry = this.ry - this.area / 2;
    }

    Fractal.prototype.zoomIn = function(x, y) {
	this.centerAt(x, y);
	this.area = this.area / 2;
	this.rx = this.rx + this.area / 2;
	this.ry = this.ry + this.area / 2;
    }

    Fractal.prototype.zoomOut = function(x, y) {
	this.centerAt(x, y);
	this.area = this.area * 2;
	this.rx = this.rx - this.area / 4;
	this.ry = this.ry - this.area / 4;
    }

    Fractal.prototype.draw = function(canvas) {	
	if (canvas && canvas.getContext) {
	    var ctx = canvas.getContext("2d");
	    this.setPixels();
	    var size = this.pixels.length;
	    for (var i = 0; i < size; i++) {
    		for (var j = 0; j < size; j++) {
		    var hue = this.pixels[i][j] % 256;
		    if  (this.pixels[i][j] == 0)
			ctx.fillStyle = "hsl(0,0%,0%)";
		    else
			ctx.fillStyle = "hsl(" + hue + ",100%,50%)";
    		    ctx.fillRect(j, i, j, i);
    		}
	    }
	}
    }

    function makePixels(size) {
	var pixels = [];
	for (var i = 0; i < size; i++) {
	    pixels[i] = [];
	    for (var j = 0; j < size; j++) {
		pixels[i][j] = 0;
	    }
	}
	return pixels;
    }

    /* Generates a fractal.
       Takes as input the size of the pixel array to be returned,
       the maximum number of iterations computed, the complex
       coordinates, and functions getC and getZ for generating the
       complex numbers for each pixel.
     */
    function fractal(size, iterations, rx, ry, area, getC, getZ, arr) {
	var e = area / size;
	var pixels = arr || makePixels(size);
	for (var y = ry, yi = 0; yi < size; y += e, yi++) {
	    for (var x = rx, xi = 0; xi < size; x += e, xi++) {
		var c = getC(x, y);
		var z = getZ(x, y);
		var i = 0;
		for (i = 0; z.abs() < 2 && i < iterations; i++)
		    z = z.mult(z).add(c);
		pixels[yi][xi] = i;
		// if max iterations reached, set value to 0
		if (i == iterations)
		    pixels[yi][xi] = 0;
	    }
	}
	return pixels;
    }

    return {
	mandelbrot: function(size, iterations, rx, ry, area) {
	    return new Mandelbrot(size, iterations, rx, ry, area);
	},
	julia: function(size, iterations, rx, ry, area, cr, ci) {
	    if (cr == undefined || ci == undefined) {
		cr = -0.7;
		ci = 0.27;
	    }
	    return new Julia(size, iterations, rx, ry, area, cr, ci);
	}
    };

})();
