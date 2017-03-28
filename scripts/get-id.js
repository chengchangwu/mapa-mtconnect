const http = require('http');
const parseString = require('xml2js').parseString;
const fs = require('fs');

http.get('http://localhost:5000/current', (res) => {
    const statusCode = res.statusCode;
    const contentType = res.headers['content-type'];

    let error;
    if (statusCode !== 200) {
      error = new Error(`Request Failed.\n` +
                        `Status Code: ${statusCode}`);
    } else if (!/^text\/xml/.test(contentType)) {
      error = new Error(`Invalid content-type.\n` +
                        `Expected text/xml but received ${contentType}`);
    }
    if (error) {
      console.log(error.message);
      // consume response data to free up memory
      res.resume();
      return;
    }

    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => rawData += chunk);
    res.on('end', () => {
        parseString(rawData, function (err, result) {
            console.dir('Botnana-ID')
            var id = result.MTConnectStreams.Streams[0].DeviceStream[0].ComponentStream[1].Events[0].Id[0]._
            console.dir(id);
            console.dir('HMI-LOG');
            var log_current = result.MTConnectStreams.Streams[0].DeviceStream[0].ComponentStream[2].Events[0].Log[0];
            console.dir(log_current);
            console.dir('Sensor-Eletricity meter');
            // Eletricity meter [voltag, current, power]
            var voltage = result.MTConnectStreams.Streams[0].DeviceStream[1].ComponentStream[1].Events[0].Electricitymeter[0];
            console.dir(voltage);
            console.dir('Sensor-Temperatrue');
            // Temperature sensor [resistance.1, electronic.1, room.1, lidqui.1, resistance.2, electronic.2, room.2, lidqui.2]
            var resistance_one = result.MTConnectStreams.Streams[0].DeviceStream[1].ComponentStream[2].Events[0].Temperaturesensor[0];
            console.dir(resistance_one);
            var lidqui_two = result.MTConnectStreams.Streams[0].DeviceStream[1].ComponentStream[2].Events[0].Temperaturesensor[7];
            console.dir(lidqui_two);

            // 記錄長亨機台號碼
            fs.writeFile('bc-id', id, (err) => {
              if (err) throw err;
              console.log('--- It\'s saved to bc-id. ---');
              console.log('ID: ' + id);
            });
        });
    });
}).on('error', (e) => {
    console.log(`Got error: ${e.message}`);
});
