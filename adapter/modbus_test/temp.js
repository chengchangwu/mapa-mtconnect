// create an empty modbus client
var ModbusRTU = require("modbus-serial");
var client = new ModbusRTU();
var id = 11;
var value = 0x1000; 
//index = temperature:0x100, voltage: 3019, current: 2999, power: 3053

client.connectRTUBuffered("/dev/ttyO0", {baudrate: 9600,  parity:"even"});

setInterval(function() {

  client.setID(id);
  client.readHoldingRegisters(value, 2, function(err, data){
    if (err){
      console.log("reading err: " + err);
    }else {
      if (id == 11) {
        console.log('temperature: ',data.data[0]/10)
        //id = 11;
        //value = 3019;
      }
      
    }
  });

}, 1000);
