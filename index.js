function connect() {
    navigator.bluetooth.requestDevice({
        filters:[{name: 'ThingyE5'}]
    });
}