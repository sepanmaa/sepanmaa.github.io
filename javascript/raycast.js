/*
A simple raycaster in JavaScript
    Copyright (C) 2016  Juho Sepänmaa

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
along with this program. If not, see <http://www.gnu.org/licenses/>.
*/



var grid = [[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
	    [1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],
	    [1,0,0,0,0,0,0,1,1,1,0,0,0,0,0,1],
	    [1,0,0,0,0,0,0,1,1,1,0,0,0,0,0,1],
	    [1,0,0,0,0,0,2,2,2,0,0,2,0,0,0,1],
	    [1,1,0,2,2,2,2,2,2,0,0,2,0,0,0,1],
	    [1,1,0,2,0,0,0,2,2,0,0,2,0,0,0,1],
	    [1,1,0,2,0,0,0,0,0,0,0,2,0,0,0,1],
	    [1,1,0,2,2,0,0,0,0,0,0,2,2,2,2,1],
	    [1,0,0,0,0,0,0,1,1,0,0,2,2,2,2,1],
	    [1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1],
	    [1,1,1,1,0,1,1,1,1,1,1,1,0,0,0,1],
	    [1,1,1,1,0,1,1,1,1,0,0,0,0,0,0,1],
	    [1,0,0,0,0,1,1,1,1,0,0,0,2,2,2,1],
	    [1,1,1,1,0,0,0,0,0,0,0,0,2,2,2,1],
	    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]],
    gridWidth = 16,
    gridHeight = 16;



/*      270             0_______________+x
         |              |
         |              |
         |              |
180------|-------0      |
         |              |
         |              |
         |              |
         90             +y

*/

var pAngle = 0, // current rotation
    gridSize = 64,
    x = Math.floor(2*gridSize+10),
    y = Math.floor(2*gridSize+10),
    pHeight = 32, // player height
    wallHeight = 64,
    fov = 640, // fov = 64
    projW = 320,
    projH = 200,
    texSize = 64,
    projDist = 277, // distance to projection plane
    rayAngle = Math.floor(fov/320), // angle between rays
    blackColor = "rgb(0, 0, 0)",
    ceilColor = "rgb(32, 32, 32)",
    floorColor = "rgb(96, 96, 96)",
    bob = 0,
    vTiles = [],
    hTiles = [],
    tanArray = [],
    sinArray = [],
    cosArray = [],
    turnLeft = false,
    turnRight = false,
    moveForward = false,
    moveBackward = false;

// precalculate trigonometric values for better performance
function makeArrays() {
    for (var i = 0; i < 3601; i++) {
	tanArray.push(tan(i));
	sinArray.push(sin(i));
	cosArray.push(cos(i));
    }
}

function toRad(angle) {
    return angle*(Math.PI/1800);
}

function tan(angle) {
    return (Math.tan(toRad(angle)));
}

function sin(angle) {
    return (Math.sin(toRad(angle)));
}

function cos(angle) {
    return (Math.cos(toRad(angle)));
}

function render(ctx) {
    var a = pAngle-(fov/2);    
    ctx.fillStyle = ceilColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height/2);
    ctx.fillStyle = floorColor;
    ctx.fillRect(0, canvas.height/2, canvas.width, canvas.height);

    for (var i = 0; i < 320; i++) {
	var angle = a+rayAngle*i,
	    distX, distY, 
	    rayX, rayY,
	    distA = 999999, // distance to wall
	    distB = 999999;

	if (angle > 3600)
	    angle -= 3600;
	else if (angle < 0)
	    angle += 3600

	// horizontal ray direction
	var dir = (angle < 1800 && angle > 0) ? 1 : -1;

	// x and y coordinates where ray interects grid
	rayY = ((y >> 6) << 6) + (dir === 1 ? gridSize : -0.001);
	rayX = x + (rayY-y)/(tanArray[angle]);

	// distances between grid intersections
	distX = gridSize/(dir*tanArray[angle]);
	distY = gridSize * dir;

	while (true) {
	    // divide by 64 to get grid coordinates
	    var gridX = rayX >> 6;
	    var gridY = rayY >> 6;
            if (gridX < 0 || gridY < 0 || gridX >= gridWidth || gridY >= gridHeight)
		break;
	    if (grid[gridY][gridX] > 0) {
		var wallA = grid[gridY][gridX];
		// x coordinate where ray hits wall
		var hitPosA = Math.floor(rayX) - ((rayX >> 6) << 6);
		distA = distanceTo(rayX, rayY);
		break;
	    }
	    // step to next intersection
	    rayX = rayX+distX;
	    rayY = rayY+distY;
	}

	dir = (angle < 900 || angle > 2700) ? 1 : -1;

	rayX = ((x >> 6) << 6) + (dir === 1 ? gridSize : -0.001); 
	rayY = y + (rayX-x)*(tanArray[angle]);

	distX = gridSize * dir;
	distY = gridSize*dir*tanArray[angle];

	while (true) {
	    var gridX = rayX >> 6;
	    var gridY = rayY >> 6;
            if (gridX < 0 || gridY < 0 || gridX >= gridWidth || gridY >= gridHeight)
		break;
	    if (grid[gridY][gridX] > 0) {
		var wallB = grid[gridY][gridX];
		var hitPosB = Math.floor(rayY) - ((rayY >> 6) << 6);
		distB = distanceTo(rayX, rayY);		
		break;
	    }
	    rayX = rayX+distX;
	    rayY = rayY+distY;
	}

	var correction = cosArray[Math.abs(pAngle-angle)]; // fisheye correction

	if (distA < distB) {
	    var dist = correction * distA;
	    var hitPos = hitPosA;
	    var wallType = wallA;
	    var tiles = hTiles;
	} else {
	    var dist = correction * distB;
	    var hitPos = hitPosB;
	    var wallType = wallB;
	    var tiles = vTiles;
	}
	
	var height = (wallHeight/dist)*projDist;
	var top = (projH-height)/2+bob;

	var texture = tiles[wallType-1];

	ctx.drawImage(texture,
		      // texture coordinates
		      hitPos, 0, 1, texSize,
		      // canvas coordinates
		      i*2, top*2, 3, height*2); 
    }
}

function distanceTo(rayX, rayY) {
    return Math.sqrt(Math.pow(x-rayX, 2)+Math.pow(y-rayY, 2));
}

function generateTextures() {
    var c = document.createElement("canvas");
    var ctx = c.getContext("2d");
    var id = ctx.createImageData(texSize, texSize),
	id2 = ctx.createImageData(texSize, texSize);
    vTiles = [new Image(), new Image()];
    hTiles = [new Image(), new Image()];
    for (var i = 0; i < id.data.length; i += 4) {
	var gradient = 255 ^ i >> 6;
	// create lighter and darker versions of the same texture
	setImgData(id, 0, 0, gradient);
	setImgData(id2, 0, 0, gradient/2);
    }
    ctx.putImageData(id, 0, 0);
    vTiles[0].src = c.toDataURL("image/png");
    ctx.putImageData(id2, 0, 0);
    hTiles[0].src = c.toDataURL("image/png");
    for (var i = 0; i < id.data.length; i += 4) {
	var x = i % 64;
	var y = i >> 6;
	var xor = (x ^ y) % 64
	setImgData(id, xor*4, 0, 0);
	setImgData(id2, xor*2, 0, 0);
    }
    ctx.putImageData(id, 0, 0);
    vTiles[1].src = c.toDataURL("image/png");
    ctx.putImageData(id2, 0, 0);
    hTiles[1].src = c.toDataURL("image/png");
    function setImgData(id, r, g, b) {
	id.data[i+0]=r;
	id.data[i+1]=g;
	id.data[i+2]=b;
	id.data[i+3]=255;
    }
}


function draw() {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    generateTextures();
    makeArrays();
    ctx.fillStyle = blackColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    document.addEventListener("keyup", function(e) {
	if (e.keyCode === 37)
	    turnLeft = false;
	else if (e.keyCode == 39)
	    turnRight = false;
	else if (e.keyCode == 38)
	    moveForward = false;
	else if (e.keyCode == 40)
	    moveBackward = false;
    });
    document.addEventListener("keydown", function(e) {
	if (e.keyCode === 37)
	    turnLeft = true;
	else if (e.keyCode === 39)
	    turnRight = true;
	else if (e.keyCode === 38)
	    moveForward = true;
	else if (e.keyCode === 40)
	    moveBackward = true;
    });
    var time = 0;
    function renderFrame(timestamp) {
        delta = timestamp - time;
	if (turnLeft) {
	    pAngle -= 20;
	    if (pAngle < 0)
	        pAngle += 3600;
	} else if (turnRight) {
	    pAngle += 20;
	    if (pAngle > 3600)
	        pAngle -= 3600;
	}
	if (moveForward) {
	    bob = Math.floor(Math.sin(time/75.0)*2) // move head up and down
	    var tmpX = x + cosArray[pAngle]*3;
	    var tmpY = y + sinArray[pAngle]*3;
	    if (grid[(tmpY >> 6)][(tmpX >> 6)] === 0) {
	    	x = tmpX;
	    	y = tmpY;
	    }
	} else if (moveBackward) {
	    bob = Math.floor(Math.sin(time/75.0)*2)
	    var tmpX = x - cosArray[pAngle]*3;
	    var tmpY = y - sinArray[pAngle]*3;
	    if (grid[(tmpY >> 6)][(tmpX >> 6)] === 0) {
	    	x = tmpX;
	    	y = tmpY;
	    }
	}
        if (delta >= 32) {
            time = timestamp;
	    render(ctx);
        }
        requestAnimationFrame(renderFrame);
    }
    renderFrame();
}

draw();
