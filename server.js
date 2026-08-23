const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
require("dotenv").config();

const config = require("./config");

const app = express();
const server = http.createServer(app);
const io = new socketIO.Server(server);

global.IO = io;

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.use("/", require("./router"));

io.on("connection", (socket) => {

    console.log(" User Connected");

    socket.on("disconnect", () => {

        console.log(" User Disconnected");

    });

});
 
mongoose.connect(config.mongoURI)

.then(()=>{

console.log(" MongoDB Connected");

})

.catch(err=>{

console.log(err);

});

const PORT = process.env.PORT || config.port;

server.listen(PORT, () => {

    console.log("================================");

    console.log("🚀 Live Location Tracker Started");

    console.log(`Server running on port ${PORT}`);

    console.log("================================");

});