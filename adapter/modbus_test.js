// create an empty modbus client
var ModbusRTU = require("modbus-serial");
var client = new ModbusRTU();
var id = 31;
var index = 0x1000; //3059;//2999;//3019;//
//temp: 0x1000, current: 2999, voltage: 3019, power: 3053

console.log("modbus test");
console.log("id: " + id + ", index: " + index);

client.connectRTUBuffered("/dev/ttyO0", {baudrate: 9600,  parity:"even"});

setInterval(function() {
  client.setID(id);
  client.readHoldingRegisters(index, 2, function(err, data){
    if (err){
      console.log("reading err: " + err);
    }else {
        console.log("tmp: " + id + ", data: " + data.data[0]);
        //console.log("e-master: " + id + "index: " + index + ", data:" + data.buffer.readFloatBE().toFixed(2));
    }
  });

}, 500);
