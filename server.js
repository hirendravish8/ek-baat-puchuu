const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

const users = {};

io.on("connection", (socket) => {

    socket.on("join", (username) => {
        users[socket.id] = username;

        socket.emit("joined", username);

        io.emit("user list", Object.values(users));
    });

    socket.on("private message", ({ to, message }) => {

        const targetSocket = Object.keys(users).find(
            id => users[id] === to
        );

        if (targetSocket) {
            socket.to(targetSocket).emit("private message", {
                from: users[socket.id],
                message: message
            });
        }
    });

    socket.on("disconnect", () => {
        delete users[socket.id];
        io.emit("user list", Object.values(users));
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Chat server running on port ${PORT}`);
});