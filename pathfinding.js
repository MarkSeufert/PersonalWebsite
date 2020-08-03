let canvas = document.getElementById('gameCanvas');
let speedSlider = document.getElementById('speedSlider');
let algorithm = document.getElementById("pathtype");
let xStart = document.getElementById("xStart");
let yStart = document.getElementById("yStart");
let xEnd = document.getElementById("xEnd");
let yEnd = document.getElementById("yEnd");
let ctx;

var State = {
	unchecked: 1,
	checked: 2,
	calculated: 3,
	used: 4,
	wall: 5
};

let createWalls = false;
let removeWalls = false;

let boxColor = {
	1: 'white',
	2: 'red',
	3: 'blue',
	4: 'green',
	5: 'black'
}

let numXPoints;
let numYPoints;

let BOX_WIDTH;
let BOX_HEIGHT;

let start;
let end;
let pathLength;
let checkedPoints;
let LINES;
let points;
let reachedEnd;
let lastDrawnLine;

let interval;

function reinitialize(index) {
	clearInterval(interval);
	initialize();
	clearScreen();
	drawSquares();
	beginPathing();
}

window.onload = (() => {
	ctx = canvas.getContext('2d');
	clearScreen();
	initialize();
	drawSquares();
	beginPathing();
});

function beginPathing() {
	interval = setInterval(function() {
		if(!reachedEnd) {
			if(algorithm.value == "a*")
				pathingV2();
			else if(algorithm.value == "Breadth First")
				pathingV3();
		} else {
			drawPath();
		}
	}, 101 - speedSlider.value*speedSlider.value);
}

function initialize() {
	
	numXPoints = 100;
	numYPoints = 60;

	BOX_WIDTH = (canvas.width / numXPoints);
	BOX_HEIGHT = (canvas.height / numYPoints)
	start = {x: parseInt(xStart.value), y: parseInt(yStart.value)};
	end = {x: parseInt(xEnd.value), y: parseInt(yEnd.value)};
	
	pathLength = 0;
	checkedPoints = [];
	LINES = [];
	reachedEnd = false;
	lastDrawnLine = {};

	points = new Array(numXPoints);
	for (let i = 0; i < numXPoints; i++) {
		points[i] = new Array(numYPoints);
		for (let j = 0; j < numYPoints; j++) {
			if(i === start.x && j === start.y) {
				points[i][j] = {
					x: i,
					y: j,
					lengthFromStart: 0,
					lengthToEnd: Math.round(10*Math.sqrt((end.x - start.x)**2 + (end.y - start.y)**2))/10,
					state: State.checked
				}
				checkedPoints.push({
					x: i,
					y: j
				});
			} else if(i === end.x && j === end.y) {
				points[i][j] = {
					x: i,
					y: j,
					lengthFromStart: Math.round(10*Math.sqrt((end.x - start.x)**2 + (end.y - start.y)**2))/10,
					lengthToEnd: 0,
					state: State.unchecked
				}
			} else if (isWall(i, j)) {
				points[i][j] = {
					x: i,
					y: j,
					lengthFromStart: 0,
					lengthToEnd: 0,
					state: State.wall
				};
			} else {
				points[i][j] = {
					x: i,
					y: j,
					lengthFromStart: 0,
					lengthToEnd: 0,
					state: State.unchecked
				};
			}
		}
	}
}

walls = [
    	{ "minX": 6, "maxX": 7, "minY": 3, "maxY": 14 },
    	{ "minX": 8, "maxX": 11, "minY": 8, "maxY": 9 },
		{ "minX": 12, "maxX": 13, "minY": 3, "maxY": 14 },
		
		{ "minX": 17, "maxX": 18, "minY": 3, "maxY": 14 },
		{ "minX": 23, "maxX": 24, "minY": 3, "maxY": 14 },
		{ "minX": 19, "maxX": 22, "minY": 8, "maxY": 9 },
		{ "minX": 19, "maxX": 22, "minY": 3, "maxY": 4 },
		
		{ "minX": 28, "maxX": 29, "minY": 3, "maxY": 14 },
		{ "minX": 30, "maxX": 33, "minY": 3, "maxY": 4 },
		{ "minX": 33, "maxX": 34, "minY": 4, "maxY": 8 },
		{ "minX": 30, "maxX": 33, "minY": 8, "maxY": 9 },
		
		{ "minX": 38, "maxX": 39, "minY": 3, "maxY": 14 },
		{ "minX": 40, "maxX": 43, "minY": 3, "maxY": 4 },
		{ "minX": 43, "maxX": 44, "minY": 4, "maxY": 8 },
		{ "minX": 40, "maxX": 43, "minY": 8, "maxY": 9 },
		
		{ "minX": 48, "maxX": 49, "minY": 3, "maxY": 8 },
		{ "minX": 49, "maxX": 54, "minY": 8, "maxY": 9 },
		{ "minX": 54, "maxX": 55, "minY": 3, "maxY": 8 },
		{ "minX": 51, "maxX": 52, "minY": 10, "maxY": 14 },
		
		{ "minX": 12, "maxX": 13, "minY": 22, "maxY": 33},
		{ "minX": 14, "maxX": 17, "minY": 22, "maxY": 23},
		{ "minX": 17, "maxX": 18, "minY": 23, "maxY": 27},
		{ "minX": 14, "maxX": 17, "minY": 27, "maxY": 28},
		{ "minX": 17, "maxX": 18, "minY": 29, "maxY": 32},
		{ "minX": 14, "maxX": 17, "minY": 32, "maxY": 33},
		
		{ "minX": 22, "maxX": 27, "minY": 32, "maxY": 33},
		{ "minX": 22, "maxX": 27, "minY": 22, "maxY": 23},
		{ "minX": 24, "maxX": 25, "minY": 24, "maxY": 31},
		{ "minX": 31, "maxX": 32, "minY": 22, "maxY": 33},
		{ "minX": 33, "maxX": 36, "minY": 22, "maxY": 23},
		{ "minX": 36, "maxX": 37, "minY": 23, "maxY": 27},
		{ "minX": 33, "maxX": 36, "minY": 27, "maxY": 28},
		{ "minX": 34, "maxX": 35, "minY": 29, "maxY": 30},
		{ "minX": 35, "maxX": 36, "minY": 31, "maxY": 33},
		
		{ "minX": 41, "maxX": 48, "minY": 22, "maxY": 23},
		{ "minX": 44, "maxX": 45, "minY": 24, "maxY": 33},
		
		{ "minX": 52, "maxX": 53, "minY": 22, "maxY": 33},
		{ "minX": 58, "maxX": 59, "minY": 22, "maxY": 33},
		{ "minX": 54, "maxX": 57, "minY": 27, "maxY": 28},
		
		{ "minX": 63, "maxX": 64, "minY": 22, "maxY": 33},
		{ "minX": 65, "maxX": 68, "minY": 22, "maxY": 23},
		{ "minX": 65, "maxX": 68, "minY": 32, "maxY": 33},
		{ "minX": 68, "maxX": 69, "minY": 23, "maxY": 32},
		
		{ "minX": 73, "maxX": 74, "minY": 22, "maxY": 33},
		{ "minX": 75, "maxX": 78, "minY": 22, "maxY": 23},
		{ "minX": 79, "maxX": 80, "minY": 22, "maxY": 33},
		{ "minX": 75, "maxX": 78, "minY": 27, "maxY": 28},
		
		{ "minX": 84, "maxX": 85, "minY": 22, "maxY": 27},
		{ "minX": 90, "maxX": 91, "minY": 22, "maxY": 27},
		{ "minX": 85, "maxX": 90, "minY": 27, "maxY": 28},
		{ "minX": 87, "maxX": 88, "minY": 29, "maxY": 33},
		
		
		{ "minX": 18, "maxX": 19, "minY": 41, "maxY": 52},
		{ "minX": 18, "maxX": 23, "minY": 41, "maxY": 42},
		{ "minX": 18, "maxX": 23, "minY": 51, "maxY": 52},
		{ "minX": 23, "maxX": 24, "minY": 42, "maxY": 51},
		
		{ "minX": 28, "maxX": 29, "minY": 41, "maxY": 52},
		{ "minX": 28, "maxX": 33, "minY": 41, "maxY": 42},
		{ "minX": 34, "maxX": 35, "minY": 41, "maxY": 52},
		{ "minX": 28, "maxX": 33, "minY": 46, "maxY": 47},
		
		{ "minX": 39, "maxX": 40, "minY": 41, "maxY": 52},
		{ "minX": 39, "maxX": 44, "minY": 41, "maxY": 42},
		{ "minX": 39, "maxX": 44, "minY": 51, "maxY": 52},
		{ "minX": 44, "maxX": 45, "minY": 42, "maxY": 51},
		
		{ "minX": 49, "maxX": 50, "minY": 51, "maxY": 52},
		{ "minX": 49, "maxX": 50, "minY": 41, "maxY": 48}
    ];

function isWall(x, y) {
	let isItWall = false
	walls.forEach(wall => {
		if(x >= wall.minX && x <= wall.maxX && y >= wall.minY && y <= wall.maxY ) {
			isItWall = true;
			return;
		}
	});
	if(x === 0 || x === numXPoints - 1 || y === 0 || y === numYPoints - 1) {
		isItWall = true;
	}
	return isItWall;
}

//Regular A* with heuristic being distance from point to end
function pathingV1() {
	
	let lowestChecked = {};
	let valueOfLowestCheck = -1;
	for (let i = 0; i < numXPoints; i++) {
		for (let j = 0; j < numYPoints; j++) {
			if(points[i][j].state === State.checked) {
				if(valueOfLowestCheck < 0 || valueOfLowestCheck > points[i][j].lengthFromStart + points[i][j].lengthToEnd) {
					lowestChecked = points[i][j];
					valueOfLowestCheck = points[i][j].lengthFromStart + points[i][j].lengthToEnd;
				} else if (valueOfLowestCheck === points[i][j].lengthFromStart + points[i][j].lengthToEnd && lowestChecked.lengthToEnd > points[i][j].lengthToEnd) {
					lowestChecked = points[i][j];
					valueOfLowestCheck = points[i][j].lengthFromStart + points[i][j].lengthToEnd;
				}
			}
		}
	}
	//look at the 8 points around your point
	for (let i = -1; i <= 1; i++) {
		for (let j = -1; j <= 1; j++) {
			if(i != 0 || j != 0) {
				currentPoint = points[lowestChecked.x + i][lowestChecked.y + j];
				let lengthFromLowest = dist(lowestChecked, currentPoint);
				if(currentPoint.state === State.unchecked) {
					currentPoint = {
						x: lowestChecked.x + i,
						y: lowestChecked.y + j,
						lengthFromStart: (lengthFromLowest + lowestChecked.lengthFromStart),
						lengthToEnd: dist(currentPoint, end),
						state: State.checked
					};
				} else if(currentPoint.state === State.checked && currentPoint.lengthFromStart > lengthFromLowest + lowestChecked.lengthFromStart) {
					currentPoint.lengthFromStart = lengthFromLowest + lowestChecked.lengthFromStart;
				}
				points[lowestChecked.x + i][lowestChecked.y + j] = currentPoint;
			}
			drawSquare(points[lowestChecked.x + i][lowestChecked.y + j]);
		}
	}
	if (lowestChecked.x === end.x && lowestChecked.y === end.y) {
		reachedEnd = true;
		lastDrawnLine = {
			x: end.x,
			y: end.y,
			lengthFromStart: lowestChecked.lengthFromStart
		}
	}
	lowestChecked.state = State.calculated;
	drawSquare(points[lowestChecked.x][lowestChecked.y]);
}

//Same as pathing V1 but with more emphasis on distance from end and less on distance from start
function pathingV2() {
	let lowestChecked = {};
	let valueOfLowestCheck = -1;
	for (let i = 0; i < numXPoints; i++) {
		for (let j = 0; j < numYPoints; j++) {
			if(points[i][j].state === State.checked) {
				if(valueOfLowestCheck < 0 || valueOfLowestCheck > points[i][j].lengthFromStart + points[i][j].lengthToEnd) {
					lowestChecked = points[i][j];
					valueOfLowestCheck = points[i][j].lengthFromStart + points[i][j].lengthToEnd;
				} else if (valueOfLowestCheck === points[i][j].lengthFromStart + points[i][j].lengthToEnd && lowestChecked.lengthToEnd > points[i][j].lengthToEnd) {
					lowestChecked = points[i][j];
					valueOfLowestCheck = points[i][j].lengthFromStart + points[i][j].lengthToEnd;
				}
			}
		}
	}
	//look at the 8 points around your point
	for (let i = -1; i <= 1; i++) {
		for (let j = -1; j <= 1; j++) {
			if((i === 0 || j === 0) && (i + j != 0)) {
				currentPoint = points[lowestChecked.x + i][lowestChecked.y + j];
				let lengthFromLowest = dist(lowestChecked, currentPoint);
				if(currentPoint.state === State.unchecked) {
					currentPoint = {
						x: lowestChecked.x + i,
						y: lowestChecked.y + j,
						lengthFromStart: (lengthFromLowest/10 + lowestChecked.lengthFromStart),
						lengthToEnd: dist(currentPoint, end),
						state: State.checked
					};
				} else if(currentPoint.state === State.checked && currentPoint.lengthFromStart > lengthFromLowest + lowestChecked.lengthFromStart) {
					currentPoint.lengthFromStart = lengthFromLowest + lowestChecked.lengthFromStart;
				}
				points[lowestChecked.x + i][lowestChecked.y + j] = currentPoint;
			}
			drawSquare(points[lowestChecked.x + i][lowestChecked.y + j]);
		}
	}
	if (lowestChecked.x === end.x && lowestChecked.y === end.y) {
		reachedEnd = true;
		lastDrawnLine = {
			x: end.x,
			y: end.y,
			lengthFromStart: lowestChecked.lengthFromStart
		}
	}
	lowestChecked.state = State.calculated;
	drawSquare(points[lowestChecked.x][lowestChecked.y]);
}

function pathingV3() {
	let lowestCheckedIndex = 0;
	let lowestLTE = -1;
	let valueOfLowestChecked = -1;
	checkedPoints.forEach((cp,i) => {
		let lfs = points[cp.x][cp.y].lengthFromStart;
		let lte = points[cp.x][cp.y].lengthToEnd;
		if(valueOfLowestChecked < 0 || valueOfLowestChecked > lfs + lte) {
			lowestCheckedIndex = i;
			valueOfLowestChecked = lfs + lte;
			lowestLTE = lte;
		} else if (valueOfLowestChecked === lfs + lte && lowestLTE > lte) {
			lowestCheckedIndex = i;
			valueOfLowestChecked = lfs + lte;
		}
	});

	let lowestChecked = checkedPoints[lowestCheckedIndex];
	//look at the 8 points around your point
	for (let i = -1; i <= 1; i++) {
		for (let j = -1; j <= 1; j++) {
			if(i != 0 || j != 0) {
				currentPoint = points[lowestChecked.x + i][lowestChecked.y + j];
				let lengthFromLowest = dist(lowestChecked, currentPoint);
				if(currentPoint.state === State.unchecked) {
					currentPoint = {
						x: lowestChecked.x + i,
						y: lowestChecked.y + j,
						lengthFromStart: lengthFromLowest + lowestChecked.lengthFromStart,
						lengthToEnd: dist(currentPoint, end),
						state: State.checked
					};
					checkedPoints.push({
						x: lowestChecked.x + i,
						y: lowestChecked.y + j
					});
				} else if(currentPoint.state === State.checked && currentPoint.lengthFromStart > lengthFromLowest + lowestChecked.lengthFromStart) {
					currentPoint.lengthFromStart = lengthFromLowest + lowestChecked.lengthFromStart;
				}
				points[lowestChecked.x + i][lowestChecked.y + j] = currentPoint;
			}
			drawSquare(points[lowestChecked.x + i][lowestChecked.y + j]);
		}
	}
	if (lowestChecked.x === end.x && lowestChecked.y === end.y) {
		reachedEnd = true;
		lastDrawnLine = {
			x: end.x,
			y: end.y,
			lengthFromStart: lowestChecked.lengthFromStart
		}
	}
	console.log(checkedPoints)
	points[lowestChecked.x][lowestChecked.y].state = State.calculated;
	drawSquare(points[lowestChecked.x][lowestChecked.y]);
	checkedPoints.splice(lowestCheckedIndex, 1);
}

function drawPath() {
	let closestToStart = {
		x: lastDrawnLine.x,
		y: lastDrawnLine.y,
		lengthFromStart: lastDrawnLine.lengthFromStart
	};
	for (let i = -1; i <= 1; i++) {
		for (let j = -1; j <= 1; j++) {
			if(i != 0 || j != 0) {
				currentPoint = points[lastDrawnLine.x + i][lastDrawnLine.y + j];
				if (currentPoint.lengthFromStart < closestToStart.lengthFromStart && currentPoint.state != State.unchecked && currentPoint.state != State.wall) {
					closestToStart = {
						x: currentPoint.x,
						y: currentPoint.y,
						lengthFromStart: currentPoint.lengthFromStart
					}
				}
			}
		}
	}
	points[lastDrawnLine.x][lastDrawnLine.y].state = State.used;
	drawSquare(points[lastDrawnLine.x][lastDrawnLine.y]);
	LINES.push({
		from: {
			x: lastDrawnLine.x * (canvas.width / numXPoints) + (BOX_WIDTH / 2),
			y: lastDrawnLine.y * (canvas.height / numYPoints) + (BOX_HEIGHT / 2)
		},
		to: {
			x: closestToStart.x * (canvas.width / numXPoints) + (BOX_WIDTH / 2),
			y: closestToStart.y * (canvas.height / numYPoints) + (BOX_HEIGHT / 2)
		}
	})
	LINES.forEach(line => {
		ctx.beginPath();
		ctx.lineWidth = "2";
		ctx.moveTo(line.from.x, line.from.y);
		ctx.lineTo(line.to.x, line.to.y);
		ctx.stroke();
	});
	pathLength += dist(lastDrawnLine, closestToStart);
	lastDrawnLine = {
		x: closestToStart.x,
		y: closestToStart.y,
		lengthFromStart: closestToStart.lengthFromStart
	}
	document.getElementById("pathLength").innerHTML="Length: " + pathLength;
}

function dist(p1, p2) {
	return Math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2);
}

function drawSquares() {
	for (let i = 0; i < numXPoints; i++) {
		for (let j = 0; j < numYPoints; j++) {
			drawSquare(points[i][j]);
		}
	}
}

function drawSquare(point) {
	let startX = point.x * (canvas.width / numXPoints);
	let startY = point.y * (canvas.height / numYPoints);
	ctx.beginPath();
	ctx.lineWidth = '1';
	ctx.fillStyle = boxColor[point.state];
	ctx.strokeStyle = "#ccc";
	ctx.rect(startX + 1, startY + 1, BOX_WIDTH - 1, BOX_HEIGHT - 1);
	ctx.stroke();
	ctx.fill();
}

function scoreText(point) {
	ctx.fillStyle = point.state === State.wall ? "black" : "white";
	ctx.font = "2px Arial";
	ctx.textAlign = "center";
	let sum = point.lengthFromStart + point.lengthToEnd;
	ctx.fillText(Math.round(10*sum) / 10, point.x * (canvas.width / numXPoints) + (BOX_WIDTH / 2) , point.y * (canvas.height / numYPoints) + (BOX_HEIGHT / 2) + 5);
}

function clearScreen() {
	ctx.fillStyle = 'white';
	ctx.fillRect(0,0 ,canvas.width,canvas.height);
}

canvas.onmousemove = function(e) {
	let rect = this.getBoundingClientRect();
	let x = e.clientX - rect.left;
	let y = e.clientY - rect.top;

	let i = Math.floor(x / BOX_WIDTH);
	let j = Math.floor(y / BOX_HEIGHT);
	let point = points[i][j];
	
	document.getElementById("position").innerHTML="( " + point.x + ", " + point.y + " )";
};

canvas.onmousedown = function(e) {
  let rect = this.getBoundingClientRect();
  let x = e.clientX - rect.left;
  let y = e.clientY - rect.top;

	let i = Math.floor(x / BOX_WIDTH);
	let j = Math.floor(y / BOX_HEIGHT);
	let point = points[i][j];
	if (point.state === State.wall) {
		removeWalls = true;
	} else {
		createWalls = true;
	}
	toggleWall(point);
};

canvas.onmouseup = function(e) {
  // important: correct mouse position:
  let rect = this.getBoundingClientRect();
  let x = e.clientX - rect.left;
  let y = e.clientY - rect.top;

	let i = Math.floor(x / BOX_WIDTH);
	let j = Math.floor(y / BOX_HEIGHT);
	let point = points[i][j];
	removeWalls = false;
	createWalls = false;
};

function toggleWall(point) {
	if (removeWalls && point.state === State.wall) {
		point.state = State.unchecked;
		drawSquare(point)
	}
	if (createWalls && point.state != State.wall) {
		point.state = State.wall;
		drawSquare(point)
	}
}

// Update the current slider value
speedSlider.oninput = function() {
	clearInterval(interval);
	interval = setInterval(function() {
		if(!reachedEnd) {
			pathingV2();
		} else {
			drawPath();
		}
	}, 101 - speedSlider.value*speedSlider.value);
}