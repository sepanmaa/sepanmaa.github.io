"use strict";

let ROWS = 20,
    COLS = 20,
    SIZE = 20,
    maze = [];

function draw(algorithm) {
    let canvas = document.getElementById('maze');
    let ctx = canvas.getContext('2d');
    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgb(255, 255, 255)";
    if (algorithm === "kruskal")
	kruskal();
    else if (algorithm === "prim")
	prim();
    else
	dfs();
    drawMaze(ctx);
}

function drawMaze(ctx) {
    if (maze.length > 0) {
	setTimeout(() => {
	    requestAnimationFrame(() => {
		let node = maze.shift();
		ctx.fillRect(node.x*SIZE, node.y*SIZE, SIZE/2, SIZE/2);
		drawMaze(ctx);
	    });
	}, 20);
    }
}


function initGrid() {
    let grid = [];
    for (let i = 0; i < ROWS; i++) {
	grid[i] = [];
	for (let j = 0; j < COLS; j++)
	    grid[i][j] = 0;
    }
    return grid;
}

function dfs() {
    let grid = initGrid();
    let row = Math.floor(Math.random() * ROWS);
    let col = Math.floor(Math.random() * COLS);
    let stack = [];
    grid[row][col] = 1;
    maze.push({x: col, y: row});
    let neighbors = [null];
    while (stack.length > 0 || neighbors.length > 0) {
	neighbors =
	    [{row:-1,col:0},{row:1,col:0},{row:0,col:-1},{row:0,col:1}]
	    .filter(n => { return n.row+row >= 0 && n.col+col >= 0
			   && n.row+row < ROWS && n.col+col < COLS
			   && grid[n.row+row][n.col+col] === 0});
	if (neighbors.length === 0 && stack.length > 0) {
	    let cell = stack.pop();
	    row = cell.row;
	    col = cell.col;
	} else {
	    let next = neighbors[Math.floor(Math.random() * neighbors.length)];
	    stack.push({row: row, col: col});
	    col += next.col;
	    row += next.row;
	    grid[row][col] = 1;
	    maze.push({x: col-next.col*0.5, y: row-next.row*0.5});
	    maze.push({x: col, y: row});
	}
    }
}

function kruskal() {
    let cells = new DisjointSet();
    let nodes = [];
    let edges = [];
    for (let i = 0; i < ROWS; i++) {
	for (let j = 0; j < COLS; j++) {
	    cells.makeSet(i, j);
	    edges.push({u: {row: i, col: j}, v: {row: i, col: j+1},
			weight: Math.floor(Math.random()*ROWS*COLS)});
	    edges.push({u: {row: i, col: j}, v: {row: i+1, col: j},
			weight: Math.floor(Math.random()*ROWS*COLS)});
	}
    }
    edges.sort((a, b) => {return a.weight > b.weight});
    let i = 0;
    while (edges.length > 0 && cells.length > 1) {
	let w = edges.pop();
	let union = cells.union({row: w.u.row, col: w.u.col}, {row: w.v.row, col: w.v.col});
	if (union !== null) {
	    maze.push({x: w.u.col, y: w.u.row});
	    maze.push({x: w.u.col-(w.u.col-w.v.col)*0.5, y: w.u.row});
	    maze.push({x: w.u.col, y: w.u.row-(w.u.row-w.v.row)*0.5});
	    maze.push({x: w.v.col, y: w.v.row});
	}
    }
}

function prim() {
    let walls = [];
    let grid = initGrid();
    let row = Math.floor(Math.random()*ROWS);
    let col = 0;
    walls.push({u: {}, v: {row: row, col: col}});
    while (walls.length > 0) {
	let i = Math.floor(Math.random()*walls.length);
	let w = walls[i];
	walls.splice(i, 1);
	let ns = [{row: w.v.row-1, col: w.v.col},
		  {row: w.v.row+1, col: w.v.col},
		  {row: w.v.row, col: w.v.col+1},
		  {row: w.v.row, col: w.v.col-1}].filter(isWall);
	ns.forEach(n => {
	    grid[n.row][n.col] = 1;
	    walls.push({u: {row: w.v.row, col: w.v.col}, v: {row: n.row, col: n.col}});
	});	
	maze.push({x: w.u.col, y: w.u.row});
	maze.push({x: w.u.col-(w.u.col-w.v.col)*0.5, y: w.u.row});
	maze.push({x: w.u.col, y: w.u.row-(w.u.row-w.v.row)*0.5});
	maze.push({x: w.v.col, y: w.v.row});
    }
    
    function isWall(n) {
	return n.row >= 0 && n.col >= 0 && n.row < ROWS && n.col < COLS
	    && grid[n.row][n.col] === 0;
    }
}

class ListNode {
    constructor(row, col) {
	this._row = row;
	this._col = col;
	this._next = null;
	this._prev = null;
    }

    get row() {
	return this._row;
    }
    get col() {
	return this._col;
    }

    equal(node) {
	return this._row === node.row && this._col === node.col;
    }

    set row(row) {
	this._row = row;
    }
    set col(col) {
	this._col = col;
    }

    get next() {
	return this._next;
    }

    set next(node) {
	this._next = node;
    }

    get prev() {
	return this._prev;
    }

    set prev(node) {
	this._prev = node;
    }
}

class LinkedList {
    constructor() {
	this._head = null;
	this._tail = null;
	this._length = 0;
    }

    get head() {
	return this._head;
    }

    set head(node) {
	this._head = node;
    }

    get tail() {
	return this._tail;
    }

    set tail(node) {
	this._tail = node;
    }

    get length() {
	return this._length;
    }

    add(row, col) {
	let node = new ListNode(row, col);
	if (this._head === null) {
	    this._head = node;
	    this._tail = this._head;
	} else {
	    node.prev = this._tail;
	    this._tail.next = node;
	    this._tail = node;
	}
	this._length++;
    }
}

class DisjointSet {
    constructor() {
	this._sets = new Set();
	this._length = 0;
    }
    makeSet(row, col) {
	let list = new LinkedList();
	list.add(row, col);
	this._sets.add(list);
	this._length++;
    }

    union(a, b) {
	let aList = this.find(a.row, a.col);
	let bList = this.find(b.row, b.col);

	if (aList !== null && bList !== null && !aList.head.equal(bList.head)) {
	    bList.head.prev = aList.tail;
	    aList.tail.next = bList.head;
	    aList.tail = bList.tail;
	    this._sets.delete(bList);
	    this._length--;
	    return aList;
	}
	return null;
    }

    find(row, col) {
	for (let list of this._sets) {
	    let n = list.head;
	    while (n !== null) {
		if (n.row === row && n.col === col)
		    return list;
		n = n.next;
	    }
	};
	return null;
    }

    get length() {
	return this._length;
    }
}





    



