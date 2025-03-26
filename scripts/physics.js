let idcounter = 0;
function GID() {
	return idcounter++;
}

//classes
class Environment {
	constructor() {
		this.id = "E" + GID();
		//size
		this.dim = {};
		this.dim.x = 800;
		this.dim.y = 800;
		//gravity
		this.g = {};
		this.g.x = 0;
		this.g.y = 1;
		//other
		this.density = 0.01;
		this.wallElasticity = 1;
		this.wallFriction = 0.25;
	}
	setenv() {
		env = this;
	}
}

class Node {
	constructor() {
		this.id = "N" + GID();
		//position
		this.pos = {};
		this.pos.x = 0;
		this.pos.y = 0;
		//velocity
		this.vel = {};
		this.vel.x = 0;
		this.vel.y = 0;
		//physics
		this.mass = 1;
		this.gravity = true;
		this.elasticity = 0.5;
		this.dragCf = 0.1;
		//drawing
		this.radius = 5;
		this.fill = "black";
		this.visible = true;
	}
	updatePos() {
		this.pos.x += this.vel.x;
		this.pos.y += this.vel.y;
	}
	applyForce(xf, yf) {
		this.vel.x += xf / this.mass;
		this.vel.y += yf / this.mass;
	}
	applyGravity() {
		if (this.gravity == true) {
			let gxf = env.g.x * this.mass;
			let gyf = env.g.y * this.mass;

			this.applyForce(gxf, gyf);
		}
	}
	applyDrag() {
		let dragx =
			-0.5 * env.density * this.vel.x * Math.abs(this.vel.x) * this.dragCf;
		let dragy =
			-0.5 * env.density * this.vel.y * Math.abs(this.vel.y) * this.dragCf;

		this.applyForce(dragx, dragy);
	}
}

//misc functions
function normalizeVector(xvec, yvec) {
	const magnitude = Math.sqrt(xvec * xvec + yvec * yvec);

	if (magnitude === 0) {
		return { x: 0, y: 0 };
	} else {
		return { x: xvec / magnitude, y: yvec / magnitude };
	}
}

//object functions
function spawnNode() {
	let node = new Node();

	//random starting position
	node.pos.x = Math.random() * env.dim.x;
	node.pos.y = Math.random() * env.dim.y;

	//random velocity
	node.vel.x = (Math.random() - 0.5) * 50;
	node.vel.y = (Math.random() - 0.5) * 50;

	drawPoint(node);

	nodes.push(node);
}

//physics functions
//WIP node collisions
function parseNodeCollisions(colliders) {
	colliders.forEach(function (c1) {
		colliders.forEach(function (c2) {
			if (c1.id != c2.id) {
				//check distance
				let d = Math.sqrt(
					(c2.pos.x - c1.pos.x) * (c2.pos.x - c1.pos.x) +
						(c2.pos.y - c1.pos.y) * (c2.pos.y - c1.pos.y)
				);

				if (d < c1.radius + c2.radius) {
					
					//remove overlap
					//calculate collision and resulting velocities

				}
			}
		});
	});
}

//input functions
const keys = {};
document.addEventListener("keydown", function (event) {
	keys[event.code] = true;
});
document.addEventListener("keyup", function (event) {
	keys[event.code] = false;
});
function isInput(key) {
	return keys[key] === true;
}
const inputForce = 2;
function parseForceInputs(node) {
	let xdir = 0;
	let ydir = 0;

	if (isInput("KeyW")) {
		ydir += -1;
	}
	if (isInput("KeyA")) {
		xdir += -1;
	}
	if (isInput("KeyS")) {
		ydir += 1;
	}
	if (isInput("KeyD")) {
		xdir += 1;
	}

	normalized = normalizeVector(xdir, ydir);

	let xf = normalized.x * inputForce;
	let yf = normalized.y * inputForce;

	node.applyForce(xf, yf);
}

//graphics functions
const disp = document.body.querySelector("#display");
function drawPoint(node) {
	const newElement = document.createElementNS(
		"http://www.w3.org/2000/svg",
		"circle"
	);
	const r = 3;
	newElement.setAttribute("id", node.id);
	newElement.setAttribute("cx", node.pos.x);
	newElement.setAttribute("cy", node.pos.y);
	newElement.setAttribute("r", node.radius);
	newElement.style.fill = node.fill;
	disp.appendChild(newElement);
}

function updatePointPos(node) {
	const point = document.body.querySelector(`#${node.id}`);
	point.setAttribute("cx", node.pos.x);
	point.setAttribute("cy", node.pos.y);
}

function clearDisplay() {
	disp.replaceChildren();
}

//runtime functions
let running = false;
let env = new Environment();
let nodes = [];
function gameStart() {
	running = true;
	clearDisplay();
	nodes = [];

	for (let i = 0; i < 1; i++) {
		spawnNode();
	}
}

function gameTick() {
	//parseNodeCollisions(nodes);
	nodes.forEach(function (node) {
		//bounce off walls
		if (node.pos.x + node.radius > env.dim.x) {
			node.vel.x = -node.vel.x * node.elasticity;
			node.pos.x = env.dim.x - node.radius;
			node.vel.y /= 1 + env.wallFriction;
		}
		if (node.pos.y + node.radius > env.dim.y) {
			node.vel.y = -node.vel.y * node.elasticity;
			node.pos.y = env.dim.y - node.radius;
			node.vel.x /= 1 + env.wallFriction;
		}
		if (node.pos.x - node.radius < 0) {
			node.vel.x = -node.vel.x * node.elasticity;
			node.pos.x = node.radius;
			node.vel.y /= 1 + env.wallFriction;
		}
		if (node.pos.y - node.radius < 0) {
			node.vel.y = -node.vel.y * node.elasticity;
			node.pos.y = node.radius;
			node.vel.x /= 1 + env.wallFriction;
		}

		//force inputs
		parseForceInputs(node);
		node.applyGravity();
		node.applyDrag();

		node.updatePos();
		updatePointPos(node);
	});
}

//run
gameStart();
setInterval(gameTick, 1000 / 60);

//ui
//reset button
document.body
	.querySelector("#resetbutton")
	.addEventListener("click", function () {
		gameStart();
	});
//add node button
document.body
	.querySelector("#addnodebutton")
	.addEventListener("click", function () {
		spawnNode();
	});
