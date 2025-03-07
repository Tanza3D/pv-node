const fs = require("fs");

class LCD {
    static onPi = false;
    static serialPath = "/dev/ttyACM0";

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
