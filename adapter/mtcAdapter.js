var net = require('net');
var host = '192.168.7.2';
var mtc_port = 7879;
var hmi_port = 7878;

function set_time (date, time){
    var exec = require('child_process').exec;
    
    exec('date -s' + date, function(error, stdout){
        if(error) {
            console.log('error');
        }
        console.log('stdout: ', stdout);
    });
    exec('date -s' + time, function(error, stdout){
        if(error) {
            console.log('error: ', error);
        }
        console.log('stdout: ', stdout);
    });
}


console.log('Setting Botnana-A2 on time');
var setting_botnana_a2_on_time = net.createServer(function(c) { 
    console.log('HMI client connect');
    c.on('data',function(data) {
        var max_bytes = 36; //{"date":"2016-12-26","time":"13:52"}

        if (data.length === max_bytes){
            var content = JSON.parse(data.toString());
            var date = content.date;
            var time = content.time;
            
            console.log('content: ', content);
            //console.log(date +" "+ time);
            set_time(date, time);
        }
    });

    c.on('error', function(error){
        console.log(error);
    });
    c.on('close', function(){
        console.log("HMI client closed");
    });
});
setting_botnana_a2_on_time.listen(hmi_port, host);


console.log("mtc adapter startup.");
var mtc_adapter = net.createServer(function(c) { 
    console.log('MTC agent connect');
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
mtc_adapter.listen(mtc_port, host);


