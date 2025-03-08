const fs = require("fs");

class LCD {
    static onPi = false;
    static serialPath = "/dev/ttyACM0";

    static SetText(text) {
        if (this.onPi) {
            try {
                // Clear the screen first (adjust based on your display's clear screen command)
                fs.writeFileSync(this.serialPath, "\x1b[2J\x1b[H", { flag: "w" }); // ANSI clear screen command

                const maxLineLength = 16;
                let lines = text.split("\n");

                if (lines.length === 1) {
                    let spacesNeeded = maxLineLength - lines[0].length;
                    lines.push(" ".repeat(spacesNeeded));
                }

                let modifiedText = lines.join("".padStart(maxLineLength - lines[0].length, " "));

                fs.writeFileSync(this.serialPath, modifiedText, { flag: "w" });
            } catch (err) {
                console.error("Failed to write to LCD:", err);
            }
        } else {
            console.log("LCD Output:", text);
        }
    }
}

module.exports = { LCD };
