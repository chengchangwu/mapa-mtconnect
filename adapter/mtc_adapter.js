var net = require('net');
var mtc_port = 7879;
var set_time_host = '192.168.1.115'; //'192.168.7.1';
var set_time_port = 7877;
var client = new net.Socket();

var toml = require('toml');
var concat = require('concat-stream');
var fs = require('fs');
 
var ModbusRTU = require("modbus-serial");
var modbus = new ModbusRTU();
modbus.connectRTUBuffered("/dev/ttyO0", {baudrate:9600 , parity:"even"});

var resistance = [], electronic = [], room = [], lidqui = [], emeter = [];
//id = 11:電阻箱, 22:電子箱, 31:環境溫度, 41:油液溫度, 21:電表
var modbusData = [{"id":"11", "cate":"resistance", "index":0x1000},
                  {"id":"21", "cate":"electronic", "index":0x1000},
                  {"id":"31", "cate":"room", "index":0x1000},
                  {"id":"43", "cate":"lidqui", "index":0x1000},
                  {"id":"52", "cate":"emsater", "index":[3019, 2999, 3053]},
                  {"id":"22", "cate":"electronic", "index":0x1000}];

var category = {"resistance":1, "electronic":2, "room":3, "lidqui":4, "emeter":5};

// toml 格式
fs.createReadStream('modbus.toml', 'utf8').pipe(concat(function(data) {
    var parsed = toml.parse(data);
    console.log("modbus.toml: " + JSON.stringify(parsed));
}));


var fetchModbus = function (element){
    console.log("--- Featch Modbus ---");
    setInterval(function(){
        for (var i = 0; i < modbusData.length; i++){
            var id = element.id;
            var cate = Math.floor(id/10);
            var index = element[i].index;
            if(cate === 1){
                modbus.setID(id);
                modbus.readHoldingRegisters(index, 2, function(err, data){
                    if(!err){
                        resistance.push(data.data[0]/10);
                    }
                });
                console.log("|resistance." + id + "|" + data.data[0]/10 + "C\n");
            }else if (cate === 2) {
                modbus.setID(id);
                modbus.readHoldingRegisters(index, 2, function(err, data){
                    if(!err){
                        electronic.push(data.data[0]/10);
                    }
                });
                console.log("|electronic." + id + "|" + data.data[0]/10 + "C\n");
            }else if (cate === 3) {
                modbus.setID(id);
                modbus.readHoldingRegisters(index, 2, function(err, data){
                    if(!err){
                        room.push(data.data[0]/10);
                    }
                });
                console.log("|room." + id + "|" + data.data[0]/10 + "C\n");
            }else if (cate === 4) {
                modbus.setID(id);
                modbus.readHoldingRegisters(index, 2, function(err, data){
                    if(!err){
                        lidqui.push(data.data[0]/10);
                    }
                });
                console.log("|lidqui." + id + "|" + data.data[0]/10 + "C\n");
            }else if(cate === 5){
                for(var j = 0; j < 3; j++){
                    modbus.setID(id);
                    modbus.readHoldingRegisters(index[j], 2, function(err, data){
                        if(!err){
                            emeter.push = data.buffer.readFloatLE().toFixed(2);
                        }
                    });
                    console.log("|emeter."+ [j] + "|" + data.buffer.readFloatLE().toFixed(2) + "\n");
                    /*
                    if (index[j] === 3019){
                        emeter.push = data.buffer.readFloatLE().toFixed(2);
                        console.log("emeter: " + index[j] + ", voltage: " + emeter[j] + "\n");
                    } else if (index[j] === 2999){
                        emeter.push = data.buffer.readFloatLE().toFixed(2);
                        console.log("emeter: " + index[j] + ", current: " + emeter[j] + "\n");
                    } else if (index[j] === 3053){
                        emeter.push = data.buffer.readFloatLE().toFixed(2);
                        console.log("emeter: " + index[j] + ", power: " + emeter[j] + "\n");
                    } else{}
                    */
                }
            }else {}
        }
    },100);

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
        console.log("HMI settin time server connect");
    });
    client.on('data',function(data) {
        var content = JSON.parse(data.toString());
        var date = content.date;
        var time = content.time;
        setTime(date, time);
        
        console.log('Set Botnana-A2 time: ' + content.date + " "+ content.time);
        console.log('content: ' + JSON.stringify(content));
        
        fs.writeFile('serial_number', content.serial_no, function (err) {
            if (err) throw err;
            console.log('Saved serial number!');
        });


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

    // Read Adapter version
    fs.createReadStream('version.toml', 'utf8').pipe(concat(function(data) {
        var parsed = toml.parse(data);
        c.write("|adapter-version|" + parsed.adapter.version + "\n");
    }));
    
    fetchModbus(modbusData);
    setInterval(function(){
        var content = [resistance, electronic, room, lidqui, emeter];
        var emeterCate = ["voltage", "current", "power"];
            for (var i = 0; i < content.length; i++){
                if (content[i].length === 3) {
                    for (var j = 0; j < content[i].length; j++){
                        if (content[i][j]){
                            console.log("|" + emeterCate[j] + "|" + content[i][j] + "\n");
                            //c.write("|" + emeterCage[j] + "|" + content[i][j] + "\n");
                        }
                    }
                } else{
                    for (var j = 0; j < content[i].length; j++){
                        if (content[i][j]){
                            console.log("|" + modbusData[i].cate+ "." +(j+1) + "|" + content[i][j]);
                            //c.write("|" + modbusData[i].cate+ "." +(j+1) + "|" + content[i][j] + "\n");
                        }
                    }
                }
            }
    },1000);

    c.on('error', function(error){
        console.log("Botnana-A2 error" + error);
    });
    c.on('close', function(){
        console.log("MTC agent closed");
    });
});
BotnanaA2Adapter.listen(mtc_port);
