var isPi = require('detect-rpi');
var matrixLib = "./sim/rpi-led-matrix";
if (isPi()) {
    matrixLib = "rpi-led-matrix";

    const {execSync} = require("child_process");
    const {argv, env} = require("process");

    function isRunningAsRoot() {
        return process.getuid && process.getuid() === 0;
    }

    if (!isRunningAsRoot()) {
        console.log("Restarting with sudo...");
        const command = `sudo ${process.execPath} ${argv.slice(1).join(" ")}`;

        try {
            execSync(command, {stdio: "inherit", env});
        } catch (error) {
            console.error("Failed to restart with sudo:", error);
            process.exit(1);
        }

        process.exit(0);
    }

    console.log("Running as root!");
}

const {LedMatrix, GpioMapping} = require(matrixLib);
const {Jimp} = require('jimp');
const JimpR = require('jimp');

const matrix = new LedMatrix({
    ...LedMatrix.defaultMatrixOptions(),
    rows: 32,
    cols: 64,
    chainLength: 2,
    hardwareMapping: GpioMapping.AdafruitHat
}, {
    ...LedMatrix.defaultRuntimeOptions(),
    gpioSlowdown: 4
}).clear();

var draw = null;
process.on('SIGINT', function () {
    console.log("Cleaning screen properly :3");
    matrix.fgColor({r: 1, g: 0, b: 0})
    matrix.clear();
    matrix.sync();
    clearInterval(draw);
    setTimeout(() => {
        process.exit();
    }, 500)
});


async function displayImage() {
    const image = await Jimp.read('v1.png');
    image.resize({w: 64, h: 32});
    image.flip({vertical: true, horizontal: false}); // Flip vertically

    const imageM = image.clone().flip({vertical: false, horizontal: true}); // Mirror horizontally

    function drawImage(img, offsetX) {
        for (let y = 0; y < 32; y++) {
            for (let x = 0; x < 64; x++) {
                const {r, g, b} = JimpR.intToRGBA(img.getPixelColor(x, y));
                matrix.fgColor({r, g, b}).setPixel(x + offsetX, y);
            }
        }
    }
    function drawScreen() {
        drawImage(image, 0);
        drawImage(imageM, 64);
        matrix.sync();
    }

    draw = setInterval(drawScreen, 20);
}

displayImage().catch(console.error);
