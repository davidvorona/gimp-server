const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const PORT = 3000;
const UPDATE_FREQUENCY = 5000;
const IDLE_FACTOR = 3;

function removeGimpLocation(name) {
    console.log("Removing due to inactivity:", name);
    delete gimpLocations[name];
}

const gimpIdleTimers = {};
function startGimpIdleTimer(data) {
    const gimpName = data.name;
    if (gimpIdleTimers.hasOwnProperty(gimpName)) {
        clearTimeout(gimpIdleTimers[gimpName]);
    }
    gimpIdleTimers[gimpName] = setTimeout(
        () => removeGimpLocation(gimpName),
        UPDATE_FREQUENCY * IDLE_FACTOR
    );
}

function handleGimpBroadcast(data) {
    createOrUpdateGimpLocation(data);
    startGimpIdleTimer(data);
}

const gimpLocations = {};
function createOrUpdateGimpLocation(data) {
    const location = Object.assign({}, data);
    const gimpName = data.name;
    delete location.name;
    if (!gimpLocations.hasOwnProperty(gimpName)) {
        console.log("Adding GIMP location:", gimpName);
        gimpLocations[gimpName] = {};
    }
    gimpLocations[gimpName] = {
        x: parseInt(location.x, 10),
        y: parseInt(location.y, 10),
        plane: parseInt(location.plane, 10)
    };
}

const app = express()
    .use(express.urlencoded({ extended: false }))
    .use(express.json());

app.get("/ping", (req, res) => {
    try {
        const data = gimpLocations;
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ err: "Failed to ping others' locations" });
    }
});

app.post("/broadcast", (req, res) => {
    try {
        const data = req.body;
        if (!data) {
            return res.status(400).json({ err: "Location data is required" });
        }
        handleGimpBroadcast(data);
        res.json({ success: "Updated location" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ err: "Failed to broadcast location" });
    }
});

const server = http.createServer(app);

const io = new Server(server);
io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("broadcast", (data) => {
        try {
            if (!data) {
                console.error("Location data is required");
                return;
            }
            const dataObj = JSON.parse(data);
            handleGimpBroadcast(dataObj);
        } catch (err) {
            console.error(err);
        }
    });

    socket.on("ping", (callback) => {
        try {
            const data = gimpLocations;
            callback(data);
        } catch (err) {
            console.error(err);
        }
    });
});

server.listen(PORT, () => {
    console.log(`Listening on *:${PORT}`)
});
