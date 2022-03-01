const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const Storage = require("./storage");
const Gimp = require("./gimp");

const PORT = process.env.PORT || 3000;
const DATA_FILE_PATH = "./gimps.json";
const THIRTY_SEC = 30000;

// Map of group to gimp data: Map<groupName,Map<gimpName,{...}>>
const groups = {};

// TODO: Enable storage when prod environment supports it
const ENABLE_STORAGE = false;
if (ENABLE_STORAGE) {
    // Create storage accessor for gimps.json
    const gimpStorage = new Storage(DATA_FILE_PATH);

    // One-time flag that sets to true when gimp data is loaded
    let __DATA_LOADED__ = false;

    /**
     * Reads the file store and terminates the process if it throws
     * an error. If successful, loads gimp data stored in the file
     * into an in-memory object.
     */
    const loadGimpStorage = async () => {
        if (__DATA_LOADED__) {
            console.warn("Data already loaded, aborting");
            return;
        }
        try {
            const gimpData = await gimpStorage.readJson();
            Object.keys(gimpData).forEach((groupName) => {
                groups[groupName] = {};
                Object.keys(gimpData[groupName]).forEach((gimpName) => {
                    groups[groupName][gimpName] = new Gimp(gimpName);
                    groups[groupName][gimpName].update(gimpData[groupName][gimpName]);
                });
            });
            console.log("Loaded gimp data:", groups);
        } catch (err) {
            if (err.name === "SyntaxError") {
                console.error(new Error("Data not initialized or corrupted, aborting"));
            } else if (err.code === "ENOENT") {
                console.error(new Error("No data file found, aborting"));
            } else console.error(err);
            process.exit(1);
        } finally {
            __DATA_LOADED__ = true;
        }
    };

    /**
     * Starts a task that loads stored gimp data and updates
     * the file store every 30 secs.
     */
    const gimpStorageTask = async () => {
        // Load gimp data into object
        await loadGimpStorage();
        // Every interval, update gimp data
        setInterval(async () => {
            try {
                // Validate group data exists, then write
                if (groups && Object.keys(groups).length) {
                    console.log("Writing gimp data:", groups);
                    await gimpStorage.write(groups);
                }
            } catch (err) {
                console.error(err);
            }
        }, THIRTY_SEC);
    };

    gimpStorageTask();
}

/**
 * Updates the gimp data object with the provided data.
 * 
 * @param {string} groupName 
 * @param {Object<string, Object>} data 
 */
function handleGimpBroadcast(groupName, data) {
    if (!groupName) {
        throw new Error("Group name is required to update");
    }
    const gimpName = data.name;
    if (!gimpName) {
        throw new Error("Gimp name is required to update");
    }
    // Get or create group
    if (!groups[groupName]) {
        groups[groupName] = {};
    }
    const group = groups[groupName];
    // Get or create gimp
    if (!group[gimpName]) {
        group[gimpName] = new Gimp(gimpName);
    }
    const gimp = group[gimpName];
    // Update gimp
    gimp.update(data);
}

let io;
const app = express()
    .use(express.urlencoded({ extended: false }))
    .use(express.json());

app.get("/ping/:groupName", (req, res) => {
    try {
        const data = groups[req.params.groupName];
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ err: "Failed to ping others' data" });
    }
});

app.post("/broadcast/:groupName", (req, res) => {
    try {
        const data = req.body;
        if (!data) {
            return res.status(400).json({ err: "Gimp data is required" });
        }
        handleGimpBroadcast(req.params.groupName, data);
        // If socket server exists, try to broadcast to room
        if (io) {
            const roomId = req.params.groupName;
            io.to(roomId).emit("broadcast", data);
        }
        res.json({ success: "Broadcasted gimp data" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ err: "Failed to broadcast gimp data" });
    }
});

app.get("/stats", (req, res) => {
    try {
        let roomsCount, clientsCount;
        // Count of groups that are stored on the server (connected or not)
        const groupsCount = Object.keys(groups).length;
        if (io) {
            // Count of currently connected groups
            const socketRooms = io.of("/").adapter.rooms;
            const connectedGroups = Object.keys(groups).filter(g => socketRooms.has(g));
            roomsCount = connectedGroups.length;
            // Count of currently connected users
            clientsCount = io.engine.clientsCount;
        }
        res.json([
            {
                description: "The number of groups stored on the server.",
                data: groupsCount
            },
            {
                description: "The number of groups currently connected to the server.",
                data: roomsCount
            },
            {
                description: "The number of users currently connected to the server.",
                data: clientsCount
            }
        ]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ err: "Failed to get server stats" });
    }
});

const server = http.createServer(app);

if (!process.env.HTTP_ONLY) {
    io = new Server(server);
    io.on("connection", (socket) => {
        console.log("Client connected:", socket.id);
        let roomId;

        socket.on("disconnect", () => {
            socket.leave(roomId);
            console.log("Client disconnected", socket.id);
        });

        socket.on("connection-ack", (groupName) => {
            roomId = groupName;
            socket.join(roomId);
            console.log("Room joined:", roomId);
        });
        
        socket.on("ping", (callback) => {
            try {
                if (!roomId) {
                    throw new Error("No room ID defined for this socket");
                }
                const data = groups[roomId];
                callback(data);
            } catch (err) {
                console.error(err);
                callback({ err: "Failed to ping others' data" });
            }
        });

        socket.on("broadcast", (data, callback) => {
            try {
                if (!roomId) {
                    throw new Error("No room ID defined for this socket");
                }
                if (!data) {
                    return callback({ err: "Gimp data is required" });
                }
                const gimpData = JSON.parse(data);
                handleGimpBroadcast(roomId, gimpData);
                socket.to(roomId).emit("broadcast", gimpData);
                callback({ success: "Broadcasted gimp data" });
            } catch (err) {
                console.error(err);
                callback({ err: "Failed to broadcast gimp data" });
            }
        });
    });
}

server.listen(PORT, () => {
    console.log(`Listening on *:${PORT}`);
});
