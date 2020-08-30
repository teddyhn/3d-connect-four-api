const express = require("express")
const http = require("http")
const socketIo = require("socket.io")
const shortid = require("shortid")
const grid = require("./utils/grid")
const checkWin = require("./utils/checkWin")

const port = process.env.PORT || 4001
const index = require("./routes/index")

const app = express()
app.use(index)

const server = http.createServer(app)

const io = socketIo(server)

let rooms = {}

// Keeps track of which sockets (clients) are connected to what rooms
let connections = {}

io.on("connection", (socket) => {
    console.log(`Connected: ${socket.id}`)

    socket.on("disconnect", () => {
        console.log(`Disconnected: ${socket.id}`)
        socket.to(connections[socket.id]).emit("roomAbandoned")
    })

    socket.on("createRoom", () => {
        const roomID = shortid.generate().substring(0, 5)
        socket.join(roomID)
        connections[socket.id] = roomID

        rooms[roomID] = { players: [socket] }

        socket.emit("roomCreated", { id: roomID })
    })

    socket.on("joinRoom", (roomID) => {
        io.in(roomID).clients((error, clients) => {
            if (error) throw error
          
            if (clients.length === 1) {
                socket.join(roomID)
                connections[socket.id] = roomID

                rooms[roomID].players.push(socket)

                socket.to(roomID).emit("startGame")
            }

            else socket.emit("invalidRoom")
        })
    })

    // Fires after invited player joins room
    socket.on("checkValidRoom", (roomID) => {
        io.in(roomID).clients((error, clients) => {
            if (error) throw error
          
            if (clients.length === 2) {
                socket.emit("validRoom", { id: roomID })
                
                // Assign blue to host player
                socket.to(roomID).emit("assignColor", { color: "blue" })
                // Assign red to invited player
                socket.emit("assignColor", { color: "red" })

                // Randomly assign a player to have first turn

                // Expected output: 0 or 1 (2 players)
                let randInt = Math.floor(Math.random() * Math.floor(2))
                rooms[roomID].players[randInt].emit("yourTurn")
                rooms[roomID].turn = randInt
                rooms[roomID].grid = grid.updateGrid()
            }

            else socket.emit("invalidRoom")
        })
    })

    socket.on("playerTurn", (roomID, data) => {
        console.log("Player turn,", "Room ID:", roomID, data)

        rooms[roomID].grid = grid.updateGrid(rooms[roomID].grid, data)

        if (checkWin.checkWin(rooms[roomID].grid, data.color)) {
            socket.to(roomID).emit("gameWon", data.color)
            socket.emit("gameWon", data.color)
        }

        socket.to(roomID).emit("playerTurn", data)
        socket.emit("playerTurn", data)

        rooms[roomID].turn === 0 ? rooms[roomID].turn = 1 : rooms[roomID].turn = 0

        rooms[roomID].players[rooms[roomID].turn].emit("yourTurn")
    })

    socket.on("leaveRoom", (roomID) => {
        console.log(`Socket: ${socket.id} left room ${roomID}`)
        socket.leave(roomID)
    })
})

server.listen(port, () => console.log(`Listening on port ${port}`))