const {ImageLoop} = require("./imageloop");
const {Jimp} = require("jimp");
const {LCD} = require("./LCD");


class Eyes extends ImageLoop {
    images = {};
    currentEye = "neutral";

    async LoadEye(name) {
        LCD.SetText("EYES Loading\n" + name)
        this.images[name] = await Jimp.read(`assets/eyes/${name}.png`);
    }
    async Init() {
        await this.LoadEye("angry");
        await this.LoadEye("neutral");
        await this.LoadEye("sad");
    }
    GetImage() {
        return this.images[this.currentEye];
    }

    async Loop() {

    }
}



module.exports = {Eyes};