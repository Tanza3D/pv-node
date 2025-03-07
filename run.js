const {LCD} = require("./LCD");

var isPi = require('detect-rpi');
var matrixLib = "./sim/rpi-led-matrix";
if (isPi()) {
    LCD.onPi = true;
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
const {Face} = require("./face");
const {Eyes} = require("./eyes");
const {preprocessGradient} = require("./gradient");

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
    console.log("Cleaning screen properly :3\n\n");
    clearInterval(draw);
    matrix.fgColor({r: 1, g: 0, b: 0})
    matrix.clear();
    matrix.sync();
    setTimeout(() => {
        process.exit();
    }, 500)
});




// ACTUAL DISPLAY CODE LOL
async function displayImage() {
    var eyes = new Eyes();
    var face = new Face();

    await eyes._Init();
    await face._Init();

    const image = await Jimp.read('v1.png');
    image.resize({w: 64, h: 32});
    image.flip({vertical: true, horizontal: false}); // Flip vertically

    const imageM = image.clone().flip({vertical: false, horizontal: true}); // Mirror horizontally



    var gradientMap = [
        [{r: 255, g: 100, b: 190}, {r: 200, g: 100, b: 255}],
        [{r: 180, g: 60, b: 190}, {r: 255, g: 105, b: 200}],
    ];


    var preprocessedGradient = preprocessGradient(gradientMap, 65, 33);
    console.log(preprocessedGradient);

    function setPixel(x, y, a) {
        y = (32 - y); // displays are flipped IRL

        var col = preprocessedGradient[y][x];

        matrix.fgColor(col).setPixel(x, y);
        // the width is 128x32, but we actually have two 64x32 panels.
        // this function only ever takes 64x32 X/Y coords, we need to mirror to other side
        matrix.fgColor(col).setPixel(128 - x, y);
    }
    function drawImage(img, offsetX) {
        if(img == null) {
            return;
            // one day, far away
            // no function will return null
            // til then, we will check

            // Tanza, 2025
        }

        for (let y = 0; y < 32; y++) {
            for (let x = 0; x < 64; x++) {
                const {r, g, b, a} = JimpR.intToRGBA(img.getPixelColor(x, y));
                if (a > 0) {
                    setPixel(x, y, a/255);
                }
            }
        }
    }

    function drawScreen() {
        drawImage(eyes.GetImage(), 0);
        drawImage(face.GetImage(), 64);
        matrix.sync();
    }

    draw = setInterval(drawScreen, 20);
}

displayImage().catch(console.error);
