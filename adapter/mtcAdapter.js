var net = require('net');
var mtc_host = 'localhost'; //'192.168.7.2'; //
var mtc_port = 7879;
var set_time_host = 'localhost'; //'192.168.7.3'; //
var set_time_port = 7877;
var client = new net.Socket();

var ModbusRTU = require("modbus-serial");
var slave = new ModbusRTU();

var fetchSlave = function(id, value , length){
    slave.connectRTUBuffered("/dev/ttyO0", {baudrate: 19200,  parity:"even"});
    slave.setID(i);
    slave.readHoldingRegisters(value, length, function(err, data){
        if (err){
            console.log("slave err: " + err);
        }else {
            console.log("slave: " + id + ", data: " + data);
            return data;
        }
    });
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
    console.log('Botnana-A2 agent connect');

/*  
// test
    var i = 0;
    setInterval(function(){
        c.write("|Temp.1|" + (27 + i) + "C\n");
        c.write("|V-Avg.1|" + (110 + i ) "V\n");
        i++;
    },3000);

*/
    setInterval(function(){
        var content;
        var id = i
        for ( i = 1; i <= 7; i++){
            if ( i <= 5 ){
                var value = 0x1000;
                var length = 1;
                content = fetchSlave(id, value, length);
                console.log("|Temp." + i + "|" + content.data[0]/10 + "C\n");
                //c.write("|temp." + i + "|" + content.data[0] + "\n");
            } else if ( 6 < i <= 7){
                var value = 3019;
                var length = 1;
                content = fetchSlave(id, value, length);
                content = content.buffer.readFloatBE().toFixed(2);
                console.log("|V-Avg"+ (i-5) + "|" + content + "V\n");
                //c.write("|voalt|" + content + "\n");
            }
        }
    },3000);

    c.on('error', function(error){
        console.log("Botnana-A2 error" + error);
    });
    c.on('close', function(){
        console.log("MTC agent closed");
    });
});
BotnanaA2Adapter.listen(mtc_port, mtc_host);


