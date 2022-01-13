const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const Gimp = require("./gimp");

const PORT = process.env.PORT || 3000;

const groups = {};
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
        res.json({ success: "Broadcasted gimp data" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ err: "Failed to broadcast gimp data" });
    }
});

const server = http.createServer(app);

if (!process.env.HTTP_ONLY) {
    const io = new Server(server);
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
