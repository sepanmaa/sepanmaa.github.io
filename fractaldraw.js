function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}

function zoom(canvas, frac) {
    canvas.addEventListener("click",
    			    function (event) {
    				var pos = getMousePos(canvas, event);
    				frac.zoomIn(pos.x, pos.y);
				frac.draw(canvas);
    			    });    
}

function drawFractals() {
    var e = document.getElementById("fractalSet");
    var fractal = e.options[e.selectedIndex].value;
    
    var canvas = document.getElementById("fractal");
    var size = canvas.width;
    var iterations = 128;
    var x = -2;
    var y = -2;
    var area = 4;

    if (fractal == "mandelbrot")
	var frac = Fraktaali.mandelbrot(size, iterations, x, y, area);
    else
	var frac = Fraktaali.julia(size, iterations, x, y, area, -0.7, 0.27);
    
    frac.draw(canvas);
    zoom(canvas, frac);
}
