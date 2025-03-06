const {createCanvas} = require('canvas');
const {app, BrowserWindow} = require("electron");
const {Electron} = require("./electron");

class LedMatrix {
    electron;
    constructor(options) {
        this.rows = options.rows || 32;
        this.cols = options.cols || 64;
        this.chainLength = options.chainLength || 1;
        this.canvas = createCanvas(this.cols * this.chainLength, this.rows);
        this.ctx = this.canvas.getContext('2d');
        this.fg = {r: 255, g: 255, b: 255};

        app.whenReady().then(() => {
            this.electron = new Electron();
        });

        app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                app.quit();
            }
        });

        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                new Electron();
            }
        });


        this.clear();
    }

    clear() {
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        return this;
    }

    fgColor(color) {
        this.fg = color;
        return this;
    }

    setPixel(x, y) {
        this.ctx.fillStyle = `rgb(${this.fg.r},${this.fg.g},${this.fg.b})`;
        this.ctx.fillRect(x, y, 1, 1);
        return this;
    }

    sync() {
        const dataUrl = this.canvas.toDataURL();
        this.electron?.instance?.webContents?.send('fromMain', dataUrl);
        return this;
    }
}

const GpioMapping = {
    AdafruitHat: 'adafruit-hat',
    Regular: 'regular',
};

module.exports = {LedMatrix, GpioMapping};