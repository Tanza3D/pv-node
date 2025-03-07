const fs = require("fs");

class LCD {
    static onPi = false;
    static serialPath = "/dev/serial/by-id/usb-Raspberry_Pi_Pico_2_084E8A99FC91F64A-if00";

    static SetText(text) {
        if (this.onPi) {
            try {
                fs.writeFileSync(this.serialPath, text + "\n", { flag: "w" });
            } catch (err) {
                console.error("Failed to write to LCD:", err);
            }
        } else {
            console.log("LCD Output:", text);
        }
    }
}

module.exports = { LCD };
