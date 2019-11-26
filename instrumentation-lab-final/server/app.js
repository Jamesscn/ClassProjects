var express = require("express")
var app = express()
var ejs = require("ejs")
var http = require("http").Server(app)
var io = require("socket.io")(http)
var net = require("net")
var fs = require("fs")
var image = ""
var sendData = " "
var sendSocket = null
var currentPeople = 0
var database = []

const webPort = 80
const camPort = 3000

net.createServer().listen(camPort, function() {
    console.log("Server initialized on port " + camPort)
}).on("connection", function(socket) {
	console.log("Connection opened")
    imageBuffer = ""
    socket.on("data", function(data) {
        var readData = data.toString()
        if(readData.includes("END!")) {
            var foundIndex = readData.indexOf("END!")
            imageBuffer += readData.substring(0, foundIndex)
            image = imageBuffer.substring(1, imageBuffer.length)
            var peopleData = readData.substring(foundIndex + 4, foundIndex + 12)
            imageBuffer = readData.substring(foundIndex + 12, readData.length)
            io.sockets.emit("update", {
                image: image,
                people: peopleData
			});
			currentPeople = parseInt(peopleData)
        } else {
            imageBuffer += readData
        }
    })
    sendSocket = socket
    socket.on("error", function(error) {
        console.log(error)
    })
})

setInterval(function() {
    if(sendSocket) {
        if(sendSocket.destroyed) {
            sendSocket = null
        } else {
            sendSocket.write(sendData)
        }
    }
}, 100)

fs.readFile("client/data.csv", "utf8", function (err, contents) {
	var stringData = contents.split("\r\n")
	stringData = stringData.map(Number)
	database = stringData
	if(err) {
		console.log("Could not read file")
	}
})

setInterval(function() {
	fs.readFile("client/data.csv", "utf8", function (err, contents) {
		var stringData = contents.split("\r\n")
		stringData = stringData.map(Number)
		database = stringData
		if(err) {
			console.log("Could not read file")
		}
		database.push(currentPeople)
		fs.writeFile("client/data.csv", database.join("\r\n"), function(err) {
			if(err) {
				console.log("Could not write to file")
			}
		})
	})
	io.sockets.emit("people", database)
}, 1000 * 60)

io.on("connection", function(socket) {
	io.sockets.emit("people", database)
    socket.on("move", function(data) {
        sendData = data.action
    })
})

app.use("/vue", express.static("node_modules/vue/dist/"))
app.use("/chart", express.static("node_modules/chart.js/dist/"))
app.use(express.static("client"))
app.set("view engine", "ejs")

app.get("/", function (req, res) {
	res.render("index")
})

http.listen(webPort)