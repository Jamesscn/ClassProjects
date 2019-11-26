var express = require("express")
var app = express()
var ejs = require("ejs")
var http = require("http").Server(app)
var io = require("socket.io")(http)
var bluetooth = require('bluetooth-serial-port')
var serial = new bluetooth.BluetoothSerialPort()

var level = 5
var temperature = 4.5
var connected = false
var serialConnection = null
var reading = 0

const port = 80
const arduino = "98:D3:32:30:BF:41"

app.use(express.static("client"))
app.set("view engine", "ejs")

app.get("/", function (req, res) {
    res.render("index")
})

setInterval(function () {
    io.sockets.emit("update", {
        level: level,
        temperature: temperature
    })
}, 1000 / 4)

io.on("connection", function(socket) {
    if(connected) {
        socket.emit("init")
    }

    socket.on("mode", function(value) {
        if(serialConnection != null) {
            console.log("Mode set to " + value + " by user.")
            serialConnection.write(Buffer.from("Q" + value, 'utf-8'), function(err, bytesWritten) {
                if (err) console.log(err);
            })
        } else {
            console.log("User prompt not sent because bluetooth is disconnected")
        }
    })
})

serial.on('found', function(address, name) {
    console.log(address)
    if(address == arduino) {
        serial.findSerialPortChannel(address, function(channel) {
            serial.connect(address, channel, function() {
                console.log('Connected')
                process.stdin.resume()
                process.stdin.setEncoding('utf8')
                connected = true
                io.sockets.emit("init")

                serial.on('data', function(buffer) {
                    for(const buf of buffer) {
                        var data = parseInt(buf)
                        if(data == 66) {
                            reading = 0
                            continue
                        }
                        if(data == 81) {
                            reading = -1
                            continue
                        }
                        if(reading == 0) {
                            level = data / 10
                            level = Math.round(-100 / 8 * (level - 12))
                            if(level > 100) {
                                level = 100
                            }
                            if(level < 0) {
                                level = 0
                            }
                            reading = 1
                            continue
                        }
                        if(reading == 1) {
                            temperature = data / 5
                            reading = 2
                            continue
                        }
                        console.log("PACKET LOST: " + data)
                    }
                })

                serialConnection = serial
            }, function () {
                console.log('Could not connect')
            })
            serial.close()
        })
    }
})

serial.inquire()

http.listen(port)