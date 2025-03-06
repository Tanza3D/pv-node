const { BrowserWindow } = require('electron');

class Electron {
    instance = null;

    constructor() {
        this.createWindow();
    }

    createWindow() {
        this.instance = new BrowserWindow({
            width: 1000,
            height: 300,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });

        this.instance.loadFile('sim/web/index.html');

        this.instance.on('closed', () => {
            this.instance = null;
        });
    }
}

module.exports = { Electron };