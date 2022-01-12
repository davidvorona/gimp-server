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
    name = "";

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
    maxHp = DEFAULT_MAX_HP;

    /**
     * @member {number}
     */
    prayer = DEFAULT_CURRENT_PRAYER;

    /**
     * @member {number}
     */
    maxPrayer = DEFAULT_MAX_PRAYER;

    /**
     * @member {boolean} ghostMode
     */
    ghostMode = false;

    /**
     * @member {string} lastActivity;
     */
    lastActivity = "";

    /**
     * @param {string} name 
     */
    constructor(name) {
        this.name = name;
    }

    getData() {
        const data = {
            name: this.name,
            customStatus: this.customStatus,
            location: this.location,
            hp: this.hp,
            maxHp: this.maxHp,
            prayer: this.prayer,
            maxPrayer: this.maxPrayer,
            ghostMode: this.ghostMode,
            lastActivity: this.lastActivity
        };
        return data;
    }

    update(data) {
        if (data.location) {
            this.updateLocation(data.location);
        }
        // Must support a value of 0
        if (typeof data.hp === "number") {
            this.updateHp(data.hp);
        }
        // Must support a value of 0
        if (typeof data.maxHp === "number") {
            this.updateMaxHp(data.maxHp);
        }
        // Must support a value of 0
        if (typeof data.prayer === "number") {
            this.updatePrayer(data.prayer);
        }
        // Must support a value of 0
        if (typeof data.maxPrayer === "number") {
            this.updateMaxPrayer(data.maxPrayer);
        }
        // Must support empty string
        if (typeof data.customStatus === "string") {
            this.updateCustomStatus(data.customStatus);
        }
        // Must accept a false value
        if (typeof data.ghostMode === "boolean") {
            this.handleGhostMode(data.ghostMode);
        }
        if (data.lastActivity) {
            this.updateLastActivity(data.lastActivity);
        }
    }

    updateLocation(location) {
        if (typeof location.x !== "number") {
            throw new Error("Invalid x coordinate: " + location.x);
        }
        if (typeof location.y !== "number") {
            throw new Error("Invalid y coordinate: " + location.y);
        }
        if (typeof location.plane !== "number") {
            throw new Error("Invalid plane coordinate: " + location.plane);
        }
        this.location = {
            x: parseInt(location.x, 10),
            y: parseInt(location.y, 10),
            plane: parseInt(location.plane, 10)
        };
    }

    updateHp(hp) {
        if (typeof hp !== "number") {
            throw new Error("Invalid HP value: " + hp);
        }
        this.hp = hp;
    }

    updateMaxHp(hp) {
        if (typeof hp !== "number") {
            throw new Error("Invalid HP max: " + hp);
        }
        this.maxHp = hp;
    }

    updatePrayer(prayer) {
        if (typeof prayer !== "number") {
            throw new Error("Invalid prayer value: " + prayer);
        }
        this.prayer = prayer;
    }

    updateMaxPrayer(prayer) {
        if (typeof prayer !== "number") {
            throw new Error("Invalid prayer max: " + prayer);
        }
        this.maxPrayer = prayer;
    }

    updateCustomStatus(customStatus) {
        if (typeof customStatus !== "string") {
            throw new Error("Invalid custom status: " + customStatus);
        }
        this.customStatus = customStatus;
    }

    handleGhostMode(ghostMode) {
        if (typeof ghostMode !== "boolean") {
            throw new Error("Invalid ghost mode value: " + ghostMode);
        }
        this.ghostMode = ghostMode;
        // Remove current location if ghost mode is enabled,
        // client will no longer send location updates
        if (this.ghostMode) {
            delete this.location;
        }
    }

    updateLastActivity(activity) {
        if (typeof activity !== "string") {
            throw new Error("Invalid activity value: " + activity);
        }
        this.lastActivity = activity;
    }
}

module.exports = GroupIronmanPlayer;
