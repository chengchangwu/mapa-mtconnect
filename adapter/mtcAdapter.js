var net = require('net');
var mtc_host = '192.168.7.2'; //'localhost'; //
var mtc_port = 7879;
var set_time_host = '192.168.7.3'; //'localhost'; //
var set_time_port = 7877;
var client = new net.Socket();

function set_time (date, time){
    var exec = require('child_process').exec;
    exec("date --set '" + date + " " + time + "'", function(error, stdout){
        if(error) {
            console.log('error');
        }
        console.log('stdout: ', stdout);
    });
}

var try_setting_time = function() {
    client = new net.Socket();
    var timer;

    client.connect(set_time_port, set_time_host, function(){
        clearTimeout(timer);
    });
    client.on('data',function(data) {
        var content = JSON.parse(data.toString());
        var date = content.date;
        var time = content.time;
        set_time(date, time);
        
        console.log('Set Botnana-A2 time: ' + content.date + " "+ content.time);
    });
    client.on('error', function(err) {
        console.log("Setting time err: unable to connect to HMI");
        timer = setTimeout(function(){
            console.log("Will try to reconnect HMI in 1000 milliseconds");
            try_setting_time();
        }, 1000);
    });
    client.on('close', function(data) {
        if (!data){
            console.log('HMI Server closed');
            timer = setTimeout(function(){
                console.log("Will try to reconnect HMI in 1000 milliseconds");
                try_setting_time();
            }, 1000);
        }
    });
}

try_setting_time(); // Set Botnana-A2 on time 


var Botnana_A2_adapter = net.createServer(function(c) { 
    console.log('Botnana-A2 agent connect');

    c.on('data',function(data) {
        console.log('send log');

        c.write("|name|value \n");
    });

    c.on('error', function(error){
        console.log(error);
    });
    c.on('close', function(){
        console.log("MTC agent closed");
    });
});
Botnana_A2_adapter.listen(mtc_port, mtc_host);


