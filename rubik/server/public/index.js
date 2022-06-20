var speedSlider = document.getElementById("speed")

height = 4
angle = Math.PI / 4
deltaHeight = 0.3
deltaAngle = 0.2

window.addEventListener("keydown", function(e) {
	//console.log(e.key)
	if(e.key == "ArrowUp") {
		if(height < 4) {
			height += deltaHeight
		}
	}
	if(e.key == "ArrowDown") {
		if(height > -4) {
			height -= deltaHeight
		}
	}
	if(e.key == "ArrowRight") {
		angle -= deltaAngle
		if(angle < -2 * Math.PI) {
			angle += 2 * Math.PI
		}
	}
	if(e.key == "ArrowLeft") {
		angle += deltaAngle
		if(angle > 2 * Math.PI) {
			angle -= 2 * Math.PI
		}
	}
	console.log(angle)
})

const geometry = new THREE.PlaneGeometry(1, 1)
const colorDict = {
	"F": 0x11ad00,
	"R": 0xff0000,
	"U": 0xffffff,
	"B": 0x001aff,
	"L": 0xff5e00,
	"D": 0xffff00
}
const sideDict = "URFDLB"

var rotationSide = 0;
var rotationAngle = 0;
var upAxis = new THREE.Vector3(0, 1, 0)
var frontAxis = new THREE.Vector3(1, 0, 0)
var rightAxis = new THREE.Vector3(0, 0, 1)

var rotationSides = [
	[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 18, 19, 20, 36, 37, 38, 45, 46, 47],
	[6, 7, 8, 9, 12, 15, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 38, 41, 44],
	[2, 5, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 20, 23, 26, 29, 32, 35, 45, 48, 51],
	[15, 16, 17, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 42, 43, 44, 51, 52, 53],
	[0, 1, 2, 11, 14, 17, 33, 34, 35, 36, 39, 42, 45, 46, 47, 48, 49, 50, 51, 52, 53],
	[0, 3, 6, 18, 21, 24, 27, 30, 33, 36, 37, 38, 39, 40, 41, 42, 43, 44, 47, 50, 53]
]

var cwRotations = [
	[6, 3, 0, 7, 4, 1, 8, 5, 2, 45, 46, 47, 12, 13, 14, 15, 16, 17, 9, 10, 11, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 18, 19, 20, 39, 40, 41, 42, 43, 44, 36, 37, 38, 48, 49, 50, 51, 52, 53],
	[0, 1, 20, 3, 4, 23, 6, 7, 26, 15, 12, 9, 16, 13, 10, 17, 14, 11, 18, 19, 29, 21, 22, 32, 24, 25, 35, 27, 28, 51, 30, 31, 48, 33, 34, 45, 36, 37, 38, 39, 40, 41, 42, 43, 44, 8, 46, 47, 5, 49, 50, 2, 52, 53],
	[0, 1, 2, 3, 4, 5, 44, 41, 38, 6, 10, 11, 7, 13, 14, 8, 16, 17, 24, 21, 18, 25, 22, 19, 26, 23, 20, 15, 12, 9, 30, 31, 32, 33, 34, 35, 36, 37, 27, 39, 40, 28, 42, 43, 29, 45, 46, 47, 48, 49, 50, 51, 52, 53],
	[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 24, 25, 26, 18, 19, 20, 21, 22, 23, 42, 43, 44, 33, 30, 27, 34, 31, 28, 35, 32, 29, 36, 37, 38, 39, 40, 41, 51, 52, 53, 45, 46, 47, 48, 49, 50, 15, 16, 17],
	[53, 1, 2, 50, 4, 5, 47, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 0, 19, 20, 3, 22, 23, 6, 25, 26, 18, 28, 29, 21, 31, 32, 24, 34, 35, 42, 39, 36, 43, 40, 37, 44, 41, 38, 45, 46, 33, 48, 49, 30, 51, 52, 27],
	[11, 14, 17, 3, 4, 5, 6, 7, 8, 9, 10, 35, 12, 13, 34, 15, 16, 33, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 36, 39, 42, 2, 37, 38, 1, 40, 41, 0, 43, 44, 51, 48, 45, 52, 49, 46, 53, 50, 47]
]

var sides = []

function createFaces(cubeState) {
	for(var index = 0; index < 54; index++) {
		var material = new THREE.MeshBasicMaterial({
			color: colorDict[cubeState[index]],
			side: THREE.DoubleSide
		})
		var side = new THREE.Mesh(geometry, material)
		scene.add(side)
		sides.push(side)
	}
}

function positionFaces() {
	for(var sideIndex = 0; sideIndex < 6; sideIndex++) {
		for(var y = -1; y <= 1; y++) {
			for(var x = -1; x <= 1; x++) {
				var index = 9 * sideIndex + 3 * (x + 1) + (y + 1)
				var size = 1.5
				if(sideIndex == 0) {
					sides[index].position.set(x, size, -y)
					sides[index].rotation.set(Math.PI / 2, 0, 0)
				}
				if(sideIndex == 1) {
					sides[index].position.set(-y, -x, -size)
					sides[index].rotation.set(0, 0, 0)
				}
				if(sideIndex == 2) {
					sides[index].position.set(size, -x, -y)
					sides[index].rotation.set(0, Math.PI / 2, 0)
				}
				if(sideIndex == 3) {
					sides[index].position.set(-x, -size, -y)
					sides[index].rotation.set(Math.PI / 2, 0, 0)
				}
				if(sideIndex == 4) {
					sides[index].position.set(y, -x, size)
					sides[index].rotation.set(0, 0, 0)
				}
				if(sideIndex == 5) {
					sides[index].position.set(-size, -x, y)
					sides[index].rotation.set(0, Math.PI / 2, 0)
				}
				if(rotationSides[rotationSide].includes(index)) {
					if(rotationSide == 0) {
						sides[index].position.applyAxisAngle(upAxis, -rotationAngle)
						sides[index].rotateOnWorldAxis(upAxis, -rotationAngle)
					}
					if(rotationSide == 1) {
						sides[index].position.applyAxisAngle(frontAxis, -rotationAngle)
						sides[index].rotateOnWorldAxis(frontAxis, -rotationAngle)
					}
					if(rotationSide == 2) {
						sides[index].position.applyAxisAngle(rightAxis, rotationAngle)
						sides[index].rotateOnWorldAxis(rightAxis, rotationAngle)
					}
					if(rotationSide == 3) {
						sides[index].position.applyAxisAngle(upAxis, rotationAngle)
						sides[index].rotateOnWorldAxis(upAxis, rotationAngle)
					}
					if(rotationSide == 4) {
						sides[index].position.applyAxisAngle(frontAxis, rotationAngle)
						sides[index].rotateOnWorldAxis(frontAxis, rotationAngle)
					}
					if(rotationSide == 5) {
						sides[index].position.applyAxisAngle(rightAxis, -rotationAngle)
						sides[index].rotateOnWorldAxis(rightAxis, -rotationAngle)
					}
				}
			}
		}
	}
}

function rotateFace(rotationSide, times) {
	for(var i = 0; i < times; i++) {
		newCubeState = ""
		for(var j = 0; j < 54; j++) {
			newCubeState += cubeState[cwRotations[rotationSide][j]]
		}
		cubeState = newCubeState
	}
}

function updateCubeColours() {
	for(var sideIndex = 0; sideIndex < 6; sideIndex++) {
		for(var y = -1; y <= 1; y++) {
			for(var x = -1; x <= 1; x++) {
				var index = 9 * sideIndex + 3 * (x + 1) + (y + 1)
				sides[index].material = new THREE.MeshBasicMaterial({
					color: colorDict[cubeState[index]],
					side: THREE.DoubleSide
				})
			}
		}
	}
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var solveSteps = []
var cubeState = "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB"
fetch("solve_steps.json").then(response => response.json()).then(json => {
	cubeState = json.state
	solveSteps = json.steps
	createFaces(cubeState)
	animate()
})

var step = 0
var turns = 0
var animationRunning = false

function nextstep() {
	if(animationRunning) {
		return
	}
	while(step < solveSteps.length) {
		action = solveSteps[step][0]
		turns = solveSteps[step][1]
		if(action == "C") {
			step++
			continue
		}
		rotateFace(sideDict.indexOf(action), turns)
		rotationSide = "UFRDBL".indexOf(action)
		animationRunning = true
		step++
		break
	}
}

function prevstep() {
	if(animationRunning) {
		return
	}
	while(step > 0) {
		action = solveSteps[step - 1][0]
		turns = 4 - solveSteps[step - 1][1]
		if(action == "C") {
			step--
			continue
		}
		rotateFace(sideDict.indexOf(action), turns)
		rotationSide = "UFRDBL".indexOf(action)
		animationRunning = true
		step--
		break
	}
}

//                 0        9        18       27       36       45
//                 UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB
//const cubeState = "BDUUUDBLFRFLBRDBRULBDLFRFDUDBRUDURRBDBDLLUUFLFRRLBFLFF"

var animationTime = 0
function animate() {
	camera.position.set(5 * Math.cos(angle), height, 5 * Math.sin(angle))
	camera.lookAt(0, 0, 0)
	if(animationRunning) {
		animationTime += speedSlider.value / 1000
		if(animationTime >= turns) {
			animationRunning = false
			updateCubeColours()
			animationTime = 0
		}
	}
	rotationAngle = Math.PI / 2 * animationTime
	positionFaces()

	requestAnimationFrame(animate);
	renderer.render(scene, camera);
}
