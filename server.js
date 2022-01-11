const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const Gimp = require("./gimp");

const PORT = 3000;

const gimps = {};
function handleGimpBroadcast(data) {
    const gimpName = data.name;
    if (!gimpName) {
        throw new Error("Name is required in broadcast data");
    }
    if (!gimps[gimpName]) {
        gimps[gimpName] = new Gimp(gimpName);
    }
    const gimp = gimps[gimpName];
    gimp.update(data);
}

const app = express()
    .use(express.urlencoded({ extended: false }))
    .use(express.json());

app.get("/ping", (req, res) => {
    try {
        const data = gimps;
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ err: "Failed to ping others' data" });
    }
});

app.post("/broadcast", (req, res) => {
    try {
        const data = req.body;
        if (!data) {
            return res.status(400).json({ err: "Gimp data is required" });
        }
        handleGimpBroadcast(data);
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

        socket.on("disconnect", () => {
            console.log("Client disconnected", socket.id);
        });
        
        socket.on("ping", (callback) => {
            try {
                const data = gimps;
                callback(data);
            } catch (err) {
                console.error(err);
                callback({ err: "Failed to ping others' data" });
            }
        });

        socket.on("broadcast", (data, callback) => {
            try {
                if (!data) {
                    return callback({ err: "Gimp data is required" });
                }
                const gimpData = JSON.parse(data);
                handleGimpBroadcast(gimpData);
                io.emit("broadcast", gimpData);
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
