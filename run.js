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
    hardwareMapping: GpioMapping.AdafruitHat,
    limitRefreshRateHz: 30,
    showRefreshRate: true
}, {
    ...LedMatrix.defaultRuntimeOptions(),
    gpioSlowdown: 4, // demos look fine without this one but :/
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
    const width = 64;
    const height = 32
    var eyes = new Eyes();
    var face = new Face();

    await eyes._Init();
    await face._Init();

    var gradientMap = [
        [{r: 255, g: 100, b: 190}, {r: 200, g: 100, b: 255}],
        [{r: 180, g: 60, b: 190}, {r: 255, g: 105, b: 200}],
    ];


    var preprocessedGradient = preprocessGradient(gradientMap, 65, 33);

    function setPixel(x, y, a) {
        y = (32 - y); // displays are flipped IRL

        var colx = preprocessedGradient[y][x];

        matrix.fgColor({
            r: 255,
            g: 0,
            b: 255
        })
            .setPixel(x, y)
            .setPixel(128 - x, y);
    }

    function drawImage(img, offsetX) {
        if (img == null) {
            return;
        }

        const pixels = img.bitmap.data;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const a = pixels[idx + 3];

                if (a > 0) {
                    setPixel(x + offsetX, y, a / 255); // Offset to place the image correctly
                }
            }
        }
    }


    function drawScreen() {
        // Directly draw images
        matrix.clear();
        drawImage(eyes.GetImage(), 0);
        drawImage(face.GetImage(), 64);
        matrix.sync();
    }

    draw = setInterval(() => {
        const startTime = performance.now();  // Start time before the function call

        drawScreen();

        const endTime = performance.now();    // End time after the function call
        const duration = endTime - startTime; // Cali was culate the duration in milliseconds

        console.log(`drawScreen took ${duration.toFixed(2)}ms`);
    }, 16);


}

displayImage().catch(console.error);
