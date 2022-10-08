import express from "express";
import {Server} from "socket.io";
import {createServer} from "http";
import {createClient} from 'redis';

const client = createClient({
    url: 'redis://redis:6379'
});

client.on('error', (err) => console.log('Redis Client Error', err));

await client.connect();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:63342"
    }
});

const increase = async (socket) => {
    const value = await client.incr("value");
    io.emit("value", value);
}

const decrease = async (socket) => {
    const value = await client.decr("value");
    io.emit("value", value);
}

io.on("connection", async (socket) => {
    const value = await client.get("value") || 0
    socket.emit("value", value)

    socket.on("increase", increase)
    socket.on("decrease", decrease)
});

app.get('/hello', (req, res) => {
    res.send('Hello World!')
})

httpServer.listen(3000);
