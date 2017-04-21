// Include our libraries
var http = require('http');
var path = require('path');
var socketio = require('socket.io');
var express = require('express');
var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

// Use router to point requests to the 'files' folder
router.use(express.static(path.resolve(__dirname, 'files')));
// Variables to hold the messages and the sockets

// Configure our Serial Port
var SerialPort = require('serialport');
var port = new SerialPort('/dev/tty.usbmodem1421', {
    baudRate: 115200,
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: false,
    parser: SerialPort.parsers.readline("\r\n")
});


port.on('open', function () {
    console.log("Open Serial Communication");
    // Handles incoming data
    port.on('data', function (data) {
        console.log('Data: ' + data);
        var string = data.split(',');
        console.log(string);
        if (string[0] == 'M') {
          io.emit('readMode', string[1]);
        }
    });
});


// CODE FOR DATA TO SEND FROM SERVER TO SERIAL PORT BELOW

io.on('connection', function(socket) {
    console.log("user connected to server");
    socket.on('powerSwitch1', function(data) {
        console.log(data);
        port.write('P,' + 1 + ',' + data + 'E');
    });
    socket.on('powerSwitch2', function(data) {
        console.log(data);
        port.write('P,' + 2 + ',' + data + 'E');
    });
    socket.on('mode0', function(data) {
        console.log(data);
        port.write('M,' + data + 'E');
    });
});


// CODE FOR DATA TO SEND FROM SERVER TO SERIAL PORT ABOVE


// Start our server
server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function () {
    var addr = server.address();
    console.log("Our server is listening at", addr.address + ":" + addr.port);
});
