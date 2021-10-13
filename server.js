const express = require("express");

const PORT = 3000;
const gimpLocations = {};

function createOrUpdateGimpLocation(data) {
    const gimpName = data.name;
    delete data.name;
    if (!gimpLocations.hasOwnProperty(gimpName)) {
        gimpLocations[gimpName] = {};
    }
    gimpLocations[gimpName] = {
        x: parseInt(data.x, 10),
        y: parseInt(data.y, 10),
        plane: parseInt(data.plane, 10)
    };
}

function removeGimpLocation(name) {
    delete gimpLocations[name];
}

const app = express()
    .use(express.urlencoded({ extended: false }))
    .use(express.json());

app.get("/ping", (req, res) => {
    res.json(gimpLocations);
});

app.post("/broadcast", (req, res) => {
    try {
        const data = req.body;
        if (!data) {
            return res.status(400).json({ err: "Location data is required" });
        }
        createOrUpdateGimpLocation(data);
        res.json({ success: "Updated location" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ err: "Failed to broadcast location" });
    }
});

app.listen(PORT, () => {
    console.log(`App listening at port ${PORT}`)
});
