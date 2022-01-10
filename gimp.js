/**
 * @typedef {Object} Location
 * @property {number} x
 * @property {number} y
 * @property {number} plane
 */

const DEFAULT_CURRENT_HP = 10;
const DEFAULT_MAX_HP = 10;
const DEFAULT_CURRENT_PRAYER = 1;
const DEFAULT_MAX_PRAYER = 1;

class GroupIronmanPlayer {
    /**
     * @member {string}
     */
    username = "";

    /**
     * @member {Location}
     */
    location = {};

    /**
     * @member {string}
     */
    customStatus = "";

    /**
     * @member {number}
     */
    hp = DEFAULT_CURRENT_HP;

    /**
     * @member {number} 
     */
    hpMax = DEFAULT_MAX_HP;

    /**
     * @member {number}
     */
    prayer = DEFAULT_CURRENT_PRAYER;

    /**
     * @member {number}
     */
    prayerMax = DEFAULT_MAX_PRAYER;

    /**
     * @param {string} username 
     */
    constructor(username) {
        this.username = username;
    }

    getData() {
        return {
            name: this.username,
            customStatus: this.customStatus,
            location: this.location,
            hp: this.hp,
            hpMax: this.hpMax,
            prayer: this.prayer,
            prayerMax: this.prayerMax
        };
    }

    update(data) {
        if (data.location) {
            this.updateLocation(data.location);
        }
        if (data.hp) {
            this.updateHp(data.hp);
        }
        if (data.maxHp) {
            this.updateMaxHp(data.maxHp);
        }
        if (data.prayer) {
            this.updatePrayer(data.prayer);
        }
        if (data.maxPrayer) {
            this.updateMaxPrayer(data.maxPrayer);
        }
        if (data.customStatus) {
            this.updateCustomStatus(data.customStatus);
        }
    }

    updateLocation(location) {
        if (typeof location.x !== "number") {
            throw new Error("Invalid x coordinate", location.x);

        }
        if (typeof location.y !== "number") {
                throw new Error("Invalid y coordinate", location.y);
        }
        if (typeof location.plane !== "number") {
                throw new Error("Invalid plane coordinate", location.plane);
        }
        this.location = {
            x: parseInt(location.x, 10),
            y: parseInt(location.y, 10),
            plane: parseInt(location.plane, 10)
        };
    }

    updateHp(hp) {
        if (typeof hp !== "number") {
            throw new Error("Invalid HP value", hp);
        }
        this.hp = hp;
    }

    updateMaxHp(hp) {
        if (typeof hp !== "number") {
            throw new Error("Invalid HP max", hp);
        }
        this.hpMax = hp;
    }

    updatePrayer(prayer) {
        if (typeof prayer !== "number") {
            throw new Error("Invalid prayer value", prayer);
        }
        this.prayer = prayer;
    }

    updateMaxPrayer(prayer) {
        if (typeof prayer !== "number") {
            throw new Error("Invalid prayer max", prayer);
        }
        this.prayerMax = prayer;
    }

    updateCustomStatus(customStatus) {
        if (typeof customStatus !== "string") {
            throw new Error("Invalid custom status", customStatus);
        }
        this.customStatus = customStatus;
    }
}

module.exports = GroupIronmanPlayer;
