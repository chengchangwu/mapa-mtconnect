var net = require('net');
var mtc_host = 'localhost';
var mtc_port = 7879;
var set_time_host = '192.168.7.1';
var set_time_port = 7877;
var client = new net.Socket();
var socket;

var ModbusRTU = require("modbus-serial");
var slave = new ModbusRTU();
slave.connectRTUBuffered("/dev/ttyO0", {baudrate:9600 ,  parity:"even"});


var testFetchSlave = function (id, index, length){
    setInterval(function(){
        slave.setID(id);
        slave.readHoldingRegisters(index, length, function(err, data){
            if (err){
                console.log("sensor err: " + err);
            }else{
                if(id == 11){ 
                    console.log("|Temp." + id + "|" + data.data[0]/10 + "C\n");
                    //socket.write("|Temp." + id + "|" + data.data[0]/10 + " \n");
                    id = 22;
                }else if (id == 22) {
                    console.log("|Temp." + id + "|" + data.data[0]/10 + "C\n");
                    //socket.write("|Temp." + id + "|" + data.data[0]/10 + " \n");
                    id = 31;
                }else if (id == 31) {
                    console.log("|Temp." + id + "|" + data.data[0]/10 + "C\n");
                    //socket.write("|Temp." + id + "|" + data.data[0]/10 + " \n");
                    id = 41;
                }else if (id == 41) {
                    console.log("|Temp." + id + "|" + data.data[0]/10 + "C\n");
                    //socket.write("|Temp." + id + "|" + data.data[0]/10 + " \n");
                    id = 11;
                    //id = 21;
                    //index = 3020;
                }
              /*
                else if (id == 21) {
                    console.log("|V-Age." + id + "|" + data.buffer.readFloatLE().toFixed(2) + "V\n");
                    //c.write("|V-Age." + id + "|" + data.buffer.readFloatLE().toFixed(2) + "V\n");
                    id = 11;
                    index = 0x1000;
                }
                */
                else {}
            }
        }); 
    },30000);

}

function setTime (date, time){
    var exec = require('child_process').exec;
    exec("date --set '" + date + " " + time + "'", function(error, stdout){
        if(error) {
            console.log('error');
        }
        console.log('stdout: ', stdout);
    });
}

var trySettingTime = function() {
    client = new net.Socket();
    var timer;

    client.connect(set_time_port, set_time_host, function(){
        clearTimeout(timer);
        console.log("HMI setting time server connect");
    });
    client.on('data',function(data) {
        var content = JSON.parse(data.toString());
        var date = content.date;
        var time = content.time;
        setTime(date, time);
        
        console.log('Set Botnana-A2 time: ' + content.date + " "+ content.time);
    });
    client.on('error', function(err) {
        console.log("Setting time err: unable to connect to HMI");
        timer = setTimeout(function(){
            console.log("Will try to reconnect HMI in 1000 milliseconds");
            trySettingTime();
        }, 1000);
    });
    client.on('close', function(data) {
        if (!data){
            console.log('HMI Server closed');
            timer = setTimeout(function(){
                console.log("Will try to reconnect HMI in 1000 milliseconds");
                trySettingTime();
            }, 1000);
        }
    });
}

console.log("Botnana-A2 Adapter startup");
trySettingTime(); // Set Botnana-A2 on time 

var BotnanaA2Adapter = net.createServer(function(c) { 
    console.log('Agent connected');
    var category = {temp: 0x1000, v_age: 3020, i_age: 3010, power: 3060}
    var id = 11; //11:電阻箱, 22:電子箱, 31:環境溫度, 41:油液溫度, 21:電表
    var index = 0x1000;
    var length = 1;
    socket = c;

    testFetchSlave(id, index, length);
  
    c.on('error', function(error){
        console.log("Botnana-A2 error" + error);
    });
    c.on('close', function(){
        console.log("MTC agent closed");
    });
});
BotnanaA2Adapter.listen(mtc_port); 

