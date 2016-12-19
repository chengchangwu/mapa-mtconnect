// node version: 0.10.38
var net = require('net');
var host = "192.168.7.1"; //"localhost"; //
var port = 7878;

console.log('Waitting for connection');

var server = net.createServer(function(c) { 
    /*
    c.on('data',function(data) {
        console.log('Receive:' + data);
        var regExp = new RegExp(/\* PING/);
        var result = data.toString().match(regExp);
        if (result[0] === '* PING'){
            c.write('* PONG 10000');  
            console.log('Responding with PONG');
        }
    });
    */
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
        console.log("|" + line + "\n");
        c.write("|" + line + "\n");
        rl.prompt();
    }).on('close', function() {
        console.log('Adapter server closed');
        process.exit(0);
    });

    c.on('error', function(error){
        if (error.code == 'EPIPE') {
            console.log('Agent closed. Waiting for conncetion...');
        }
    });
    c.on('close', function(){
        console.log("");
        console.log("Agent closed");
    });
});

server.listen(port, host);

