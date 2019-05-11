const ThingyMainService = 'ef680100-9b35-4933-9b10-52ffa9740042';

const ThingyUserInterfaceService = 'ef680300-9b35-4933-9b10-52ffa9740042';
const ThingyMotionService = 'ef680400-9b35-4933-9b10-52ffa9740042';

const ThingyLEDCharacteristic = 'ef680301-9b35-4933-9b10-52ffa9740042';
const ThingyMotionDataCharacteristic = 'ef680406-9b35-4933-9b10-52ffa9740042';
const controlsElement = document.querySelector('#controls');

let ledCharacteristic = null;
// let ledCharacteristicBat = null;
let motionCharacteristic = null;
let powerCounter = 0;
const powerBar = document.getElementById("myBar");  
const ledBatteryLevel = document.getElementById("ledBattery");  
const motionBatteryLevel = document.getElementById("motionBattery");  


let gameStartedFlag = false;
// let slider = document.getElementById("myIntensity");
// let output = document.getElementById("demo");
// output.innerHTML = slider.value; // Display the default slider value

// function onButtonBattery() {
//     log('Requesting Bluetooth Device...');
//     navigator.bluetooth.requestDevice(
//       {filters: [{services: ['battery_service']}]})
//     .then(device => {
//       log('Connecting to GATT Server...');
//       return device.gatt.connect();
//     })
//     .then(server => {
//       log('Getting Battery Service...');
//       return server.getPrimaryService('battery_service');
//     })
//     .then(service => {
//       log('Getting Battery Level Characteristic...');
//       return service.getCharacteristic('battery_level');
//     })
//     .then(characteristic => {
//       log('Reading Battery Level...');
//       return characteristic.readValue();
//     })
//     .then(value => {
//       let batteryLevel = value.getUint8(0);
//       log('> Battery Level is ' + batteryLevel + '%');
//     })
//     .catch(error => {
//       log('Argh! ' + error);
//     });
//   }

async function connectLed() {
  try {
      const device = await navigator.bluetooth.requestDevice({
          filters:[
              {namePrefix: 'Thingy'},
              {services: ['battery_service']},
            ],
          // filters: [...] <- Prefer filters to save energy & show relevant devices.
        //   acceptAllDevices: true,
          optionalServices: [ThingyUserInterfaceService]  
      });
  
      console.log('Connecting to GATT Server...');
      await device.gatt.connect();
      console.log('Getting Services...');
  
      const service = await device.gatt.getPrimaryService(ThingyUserInterfaceService);
      console.log(service);
      ledCharacteristic = await service.getCharacteristic(ThingyLEDCharacteristic);
      const serviceBat = await device.gatt.getPrimaryService('battery_service');
      console.log(serviceBat);
      const ledCharacteristicBat = await serviceBat.getCharacteristic('battery_level');
      const value = await ledCharacteristicBat.readValue();
      console.log(value);
      ledBatteryLevel.innerHTML =  ' ' + value.getUint8(0) + '%';

  } catch(error) {
      console.log('Argh!' + error);
  }
}
async function connectThingy() {
    try {
        const device = await navigator.bluetooth.requestDevice({
            filters:[
                {namePrefix: 'Thingy'},
                {services: ['battery_service']},
              ],            
            // acceptAllDevices: true,
            optionalServices:  [ThingyMotionService]  
        });
    
        console.log('Connecting to GATT Server...');
        await device.gatt.connect(); 
        console.log('Getting Services...');
        const service = await device.gatt.getPrimaryService(ThingyMotionService);
        console.log(service);
        motionCharacteristic = await service.getCharacteristic(ThingyMotionDataCharacteristic);
        // char.writeValue(new Uint8Array([]));
        motionCharacteristic.addEventListener('characteristicvaluechanged', () => {
            const {value} = motionCharacteristic;
            const accelX = value.getInt16(0, true) / 1000.0;
            const accelY = value.getInt16(2, true) / 1000.0;
            const accelZ = value.getInt16(4, true) / 1000.0;
            const totalPower = Math.abs(Math.sqrt(accelX ** 2 + accelY ** 2 + accelZ ** 2) - 1);
            powerCounter += Math.abs(totalPower);
            // console.log(accelX, accelY, accelZ, totalPower);
            powerBar.style.width = Math.round(totalPower * 20) + '%';
            powerBar.innerHTML = Math.round(totalPower * 20)  + '%';
            if (gameStartedFlag) {
                setLEDColorConstant(Math.round(255 - totalPower * 100), parseInt(totalPower * 100), 0);
            }            
        });
        await motionCharacteristic.startNotifications();

        const serviceBat = await device.gatt.getPrimaryService('battery_service');
        console.log(serviceBat);
        motionCharacteristicBat = await serviceBat.getCharacteristic('battery_level');
        const value = await motionCharacteristicBat.readValue();
        console.log(value);
        motionBatteryLevel.innerHTML =  ' ' + value.getUint8(0) + '%';
  

    } catch(error) {
        console.log('Argh!' + error);
    }
}

async function setLEDColorConstant(r, g, b) {
    const mode = 1; // 0 = off, 1 = on, 2 = breathe, 3 = one shot
    if(ledCharacteristic) {
        try {
            // let mode = document.querySelector('#ledMode').value
            // console.log(mode);
            return await ledCharacteristic.writeValue(new Uint8Array([mode, r, g, b]));
        } catch (error) {
            console.log('ledWrite ' + error);
        }        
    }
  }
function changeLEDColorConstant(val)  {
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
    try {
        // let mode = document.querySelector('#ledMode').value
        console.log(mode, color, intensity);
        await ledCharacteristic.writeValue(new Uint8Array([mode, color, intensity, 50, 20]));
        // await ledCharacteristic.writeValue(buffer);
    } catch (error) {
        console.log('ledWrite ' + error);
    }    
}

function startGame() {
    powerCounter = 0;
    let seconds = 0;
    if(motionCharacteristic) {
        gameStartedFlag = true;
        console.log('Game started~');
        const timer = setInterval(() => {
            if(seconds == 10) {
                // document.querySelector('h1').innerText = 'Score: ' + powerCounter.toFixed(2);
                gameSeconds.innerText = 'Score: ' + powerCounter.toFixed(0);
                clearInterval(timer);
                gameStartedFlag = false;
                return;
            }
            seconds++;
            console.log('Time left:  %c' + (10 - seconds), 'color:red; font-weight: bold; font-size: 50px;');
            gameSeconds.innerHTML =  10 - seconds;
        }, 1000);
    }   
}

