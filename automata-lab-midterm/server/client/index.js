var socket = io()
var glassElement = document.getElementById("glass")
var heroElement = document.getElementsByClassName("hero")[0]
var dashElement = document.getElementById("dash")
var levelElement = document.getElementById("level")
var tempElement = document.getElementById("temp")
var firstMode = document.getElementById("mode1")
var secondMode = document.getElementById("mode2")
var thirdMode = document.getElementById("mode3")
var firstButton = document.getElementById("btn1")
var secondButton = document.getElementById("btn2")
var thirdButton = document.getElementById("btn3")
var levelCanvasElement = document.getElementById("levelChart")
var levelCanvas = levelCanvasElement.getContext("2d")
var levelChart = null
var tempCanvasElement = document.getElementById("tempChart")
var tempCanvas = tempCanvasElement.getContext("2d")
var tempChart = null

var levelData = []
var tempData = []
var level = 0
var temp = 0
var mode = 0
var index = 0

window.onload = function () {
    for(var i = 0; i < 10; i++) {
        levelData[i] = 0
        tempData[i] = 0
    }
    firstButton.addEventListener("click", function(event) {
        mode = 0
        firstMode.classList.add("expand")
        secondMode.classList.remove("expand")
        thirdMode.classList.remove("expand")
        firstMode.classList.remove("shrink")
        secondMode.classList.add("shrink")
        thirdMode.classList.add("shrink")
        firstButton.classList.add("is-dark")
        secondButton.classList.remove("is-dark")
        thirdButton.classList.remove("is-dark")
        socket.emit("mode", 0)
    })
    secondButton.addEventListener("click", function(event) {
        mode = 1
        firstMode.classList.remove("expand")
        secondMode.classList.add("expand")
        thirdMode.classList.remove("expand")
        firstMode.classList.add("shrink")
        secondMode.classList.remove("shrink")
        thirdMode.classList.add("shrink")
        firstButton.classList.remove("is-dark")
        secondButton.classList.add("is-dark")
        thirdButton.classList.remove("is-dark")
        socket.emit("mode", 1)
    })
    thirdButton.addEventListener("click", function(event) {
        mode = 2
        firstMode.classList.remove("expand")
        secondMode.classList.remove("expand")
        thirdMode.classList.add("expand")
        firstMode.classList.add("shrink")
        secondMode.classList.add("shrink")
        thirdMode.classList.remove("shrink")
        firstButton.classList.remove("is-dark")
        secondButton.classList.remove("is-dark")
        thirdButton.classList.add("is-dark")
        socket.emit("mode", 2)
    })
    levelChart = new Chart(levelCanvas, {
        type: 'line',
        data: {
            labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            datasets: [{
                label: "Level %",
                data: levelData,
                pointBackgroundColor: "white",
                borderColor: "white"
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        max: 100
                    }
                }]
            }
        }
    })
    tempChart = new Chart(tempCanvas, {
        type: 'line',
        data: {
            labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            datasets: [{
                label: "Temperature (°C)",
                data: tempData,
                pointBackgroundColor: "white",
                borderColor: "white"
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        max: 51
                    }
                }]
            }
        }
    })
    draw()
}

socket.on("init", function() {
    dashElement.style.display = "block"
    dashElement.style.animation = "appear 2s forwards"
    heroElement.classList.add("myhero")
    glassElement.style.display = "none"
})

socket.on("update", function(data) {
    level = data.level
    temp = data.temperature
    levelElement.textContent = level + "%"
    tempElement.textContent = temp + "°C"
    for(var i = 0; i < 9; i++) {
        levelData[i] = levelData[i + 1]
        tempData[i] = tempData[i + 1]
    }
    levelData[9] = level
    tempData[9] = temp
})

function draw() {
    levelChart.data.datasets[0].data = levelData
    tempChart.data.datasets[0].data = tempData
    levelChart.update(0)
    tempChart.update(0)
    requestAnimationFrame(draw)
}