var net = require('net');
var host = "localhost";
var port = 7878;

var now = new Date();
var isoData = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString(); 
//get.Time(): Return the number of milliseconds since midnight Jan 1 1970, and a specified date.
//get.TimezoneOffset : Returns the time difference between UTC time and local time, in minutes.
console.log('Waitting for connection');

var server = net.createServer(function(c) { 
    c.on('data',function(data) {
        console.log('Receive:' + data);
        var regExp = new RegExp(/\* PING/);
        var result = data.toString().match(regExp);
        if (result[0] === '* PING'){
            console.log('Responding with PONG');
            c.write('* PONG 10000');  


            console.log("Agent connected");
            console.log("Type an adapter feed string in the followning format:");
            console.log("key|value");
            console.log("key|value|key1|value1...");
            
            // Readline 
            var readline = require('readline');
            var rl = readline.createInterface(process.stdin, process.stdout);

            rl.setPrompt(">");
            rl.prompt();
            
            rl.on('line', function(line) {
                console.log(isoData + "|" + line + "\n");
                c.write(isoData + "|" + line + "\n");
                rl.prompt();
            }).on('close', function() {
                console.log('Adapter server closed');
                process.exit(0);
            });
        }
    });

    c.on('error', function(error){
        console.log(error);
    });
    c.on('close', function(){
        console.log("");
        console.log("Agent closed");
        process.exit(0);
    });
});

server.listen(port, host);



