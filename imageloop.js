class ImageLoop {
    constructor() {
        this.intervalId = null;
    }

    async _Init() {
        await this.Init();
        this.Start();
    }

    /**
     * @abstract
     */
    async Loop() {}

    /**
     * @abstract
     */
    async Init() {}

    /**
     * @abstract
     */
    GetImage() {}

    Start() {
        if (!this.intervalId) {
            this.intervalId = setInterval(async () => {
                await this.Loop();
            }, 1000 / 15); // 30fps hopefully
        }
    }

    Stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
}


module.exports = {ImageLoop};