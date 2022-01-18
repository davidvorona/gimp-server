const fs = require("fs");

class Storage {
    /**
     * Path to the storage file.
     * @member {string}
     */
    filePath = "";

    /**
     * Encoding of the serialized data.
     * @member {string}
     */
    ENCODING = "utf8";

    constructor(filePath) {
        this.filePath = filePath;
    }

    async read() {
        return new Promise((resolve, reject) => {
            fs.readFile(this.filePath, this.ENCODING, (err, data) => {
                if (err) {
                    return reject(err);
                }
                resolve(data);
            });
        });
    }

    readSync() {
        return fs.readFileSync(this.filePath, this.ENCODING);
    }

    async readJson() {
        return JSON.parse(await this.read());
    }

    readJsonSync() {
        return JSON.parse(this.readSync());
    }

    async write(value) {
        return new Promise((resolve, reject) => {
            fs.writeFile(this.filePath, JSON.stringify(value), (err) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    }
}

module.exports = Storage;
