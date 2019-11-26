var socket = io()
var cameraButton = document.getElementById("cameraBtn")
var dataButton = document.getElementById("dataBtn")
var screenshotButton = document.getElementById("screenshot")
var buttons = [cameraButton, dataButton]
var action = " "
var holding = false
var labelData = []
var peopleData = []
var lineChart = null

window.onload = function() {
	options = {
        scales: {
			yAxes: [{
				ticks: {
					beginAtZero: true,
					max: 1000
				}
			}]
		}
    }
	graphData = {
		labels: labelData,
		datasets: [{
			label: "# of People",
			data: peopleData,
			pointBackgroundColor: "white",
			borderColor: "white"
		}]
	}
	draw()
}

buttons[0].addEventListener("click", function() {
    buttons[params.data.page].classList.remove("border-r-4")
    params.data.page = 0
    buttons[params.data.page].classList.add("border-r-4")
})

buttons[1].addEventListener("click", function() {
    buttons[params.data.page].classList.remove("border-r-4")
    params.data.page = 1
	buttons[params.data.page].classList.add("border-r-4")
	setTimeout(function() {
		lineChart = new Chart(document.getElementById("myGraph").getContext("2d"), {
			type: 'line',
			data: graphData,
			options: options
		})
	}, 1000)
})

socket.on("update", function(data) {
    params.data.image = "data:image/jpeg;charset=utf-8;base64," + data.image
    params.data.people = parseInt(data.people)
})

socket.on("people", function(data) {
	peopleData = data
	labelData = []
	for(var i = 0; i < peopleData.length; i++) {
		labelData.push(i)
	}
	/*
	peopleData = []
	if(data.length >= 10) {
		peopleData = data.slice(data.length - 11, data.length - 1)
	} else {
		for(var i = data.length; i < 10; i++) {
			peopleData.push(0)
		}
	}
	*/
})

function draw() {
	if(lineChart) {
		lineChart.data.labels = labelData
		lineChart.data.datasets[0].data = peopleData
		lineChart.options.scales.yAxes[0].ticks.max = Math.round(Math.max(...peopleData) * 1.1)
		lineChart.update()
	}
    requestAnimationFrame(draw)
}

setInterval(function() {
    socket.emit("move", {
        action: action
    })
    if(holding == false) {
        action = " "
    }
}, 100)

var params = {
    el: '#dashboard',
    data: {
        image: "",
        people: 0,
        page: 0
    },
    methods: {
        screenshot: function(event) {
            var link = document.createElement("a")
            document.body.appendChild(link)
            link.setAttribute("href", params.data.image)
            link.setAttribute("download", "screenshot.jpg")
            link.click()
		},
        left: function(event) {
            holding = true
            action = "R"
        },
        right: function(event) {
            holding = true
            action = "L"
        },
        stop: function(event) {
            holding = false
        }
    }
}

new Vue(params)