const ThingyMainService = 'ef680100-9b35-4933-9b10-52ffa9740042';
const ThingyUserInterfaceService = 'ef680300-9b35-4933-9b10-52ffa9740042';
const ThingyLEDCharacteristic = 'ef680301-9b35-4933-9b10-52ffa9740042';
const controlsElement = document.querySelector('#controls');

let ledCharacteristic = null;

// let slider = document.getElementById("myIntensity");
// let output = document.getElementById("demo");
// output.innerHTML = slider.value; // Display the default slider value

async function connect() {

      // Validate services UUID entered by user first.
    // let optionalServices = document.querySelector('#optionalServices').value
    // .split(/, ?/).map(s => s.startsWith('0x') ? parseInt(s) : s)
    // .filter(s => s && BluetoothUUID.getService);
    let optionalServices = [ThingyUserInterfaceService];
    try {
        const device = await navigator.bluetooth.requestDevice({
            // filters:[{name: 'ThingyE5'}]
            // filters: [...] <- Prefer filters to save energy & show relevant devices.
            acceptAllDevices: true,
            optionalServices: optionalServices  
        });
    
        console.log('Connecting to GATT Server...');
        await device.gatt.connect();
    
        // Note that we could also get all services that match a specific UUID by
        // passing it to getPrimaryServices().
        console.log('Getting Services...');
    
        const service = await device.gatt.getPrimaryService(ThingyUserInterfaceService);
        console.log(service);
        ledCharacteristic = await service.getCharacteristic(ThingyLEDCharacteristic);
        // char.writeValue(new Uint8Array([]));
        

        console.log('yes!');
        console.log(device.gatt);
    } catch(error) {
        console.log('Argh!' + error);
    }
}

async function setLEDColorConstant(r, g, b) {
    const mode = 1; // 0 = off, 1 = on, 2 = breathe, 3 = one shot
    try {
        // let mode = document.querySelector('#ledMode').value
        console.log(mode);
        await ledCharacteristic.writeValue(new Uint8Array([mode, r, g, b]));
    } catch (error) {
        console.log('ledWrite ' + error);
    }    
  }
async function changeLEDColorConstant(val)  {
    const r = parseInt(val.substr(1,2), 16);
    const g = parseInt(val.substr(3,2), 16);
    const b = parseInt(val.substr(5,2), 16);
    setLEDColorConstant(r,g,b);
    console.log(val);
}
async function setLEDColorBreathe(color) {
    const mode = 2; // 0 = off, 1 = on, 2 = breathe, 3 = one shot
    const intensity = 50;
    const delay = 1200;

    var buffer = new ArrayBuffer(5);
    // var md = new Uint8Array(buffer, 0, 1);
    // var cl = new Uint8Array(buffer, 1, 1);
    // var it = new Uint8Array(buffer, 2, 1);
    // var dl = new Uint16Array(buffer, 3, 2);
    
    // // define struct
    // let struct = {
    //     mode: 2,
    //     color: 1,
    //     intensity: 50,
    //     delay: 1000
    // };
    // // write arraybuffer from javascript object
    // var ab = new ArrayBuffer(10);
    // var dv = new DataView(ab);
    
    // dv.setUint8(0, struct.mode);
    // dv.setUInt8(1, struct.color);
    // dv.setUInt8(2, struct.intensity);
    // dv.setUint16(3, struct.delay);

    // console.log(dv.buffer);

    try {
        // let mode = document.querySelector('#ledMode').value
        console.log(mode, color, intensity);
        await ledCharacteristic.writeValue(new Uint8Array([mode, color, intensity, 50, 20]));
        // await ledCharacteristic.writeValue(buffer);
    } catch (error) {
        console.log('ledWrite ' + error);
    }    
}

// Step 1: Scan for a device with 0xffe5 service
// function connect() {
//     navigator.bluetooth.requestDevice({
//         filters:[{name: 'ThingyE5'}]
//       })
//         .then(function(device) {
//           // Step 2: Connect to it
//           console.log('connect..')
//           return device.gatt.connect();
//         })
//         .then(function(server) {
//           // Step 3: Get the Service
//           return server.getPrimaryService(0x3000);
//         })
//         .then(function(service) {
//           // Step 4: get the Characteristic
//           return service.getCharacteristic(0x3001);
//         })
//         .then(function(characteristic) {
//           // Step 5: Write to the characteristic
//           var data = new Uint8Array([0xbb, 0x25, 0x05, 0x44]);
//           return characteristic.writeValue(data);
//         })
//         .catch(function(error) {
//            // And of course: error handling!
//            console.error('Connection failed!', error);
//         });
// }
