const WebSocket = require("ws")

const PORT = process.env.WS_PORT || 8080

const wss = new WebSocket.Server({ port: PORT })

console.log(`WebSocket server started on port ${PORT}`)

// Store connected clients
const clients = new Set()

wss.on("connection", function connection(ws, req) {
  console.log("New WebSocket connection from:", req.socket.remoteAddress)

  clients.add(ws)

  // Send welcome message
  ws.send(
    JSON.stringify({
      type: "connected",
      message: "Connected to auction WebSocket server",
    }),
  )

  ws.on("message", function message(data) {
    try {
      const parsedData = JSON.parse(data.toString())
      console.log("Received:", parsedData)

      // Broadcast to all connected clients
      const broadcastData = JSON.stringify(parsedData)

      clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(broadcastData)
        }
      })

      // Send acknowledgment back to sender
      ws.send(
        JSON.stringify({
          type: "ack",
          message: "Message received and broadcasted",
        }),
      )
    } catch (error) {
      console.error("Error parsing message:", error)
      ws.send(
        JSON.stringify({
          type: "error",
          message: "Invalid message format",
        }),
      )
    }
  })

  ws.on("close", function close() {
    console.log("WebSocket connection closed")
    clients.delete(ws)
  })

  ws.on("error", function error(err) {
    console.error("WebSocket error:", err)
    clients.delete(ws)
  })
})

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("Shutting down WebSocket server...")
  wss.close(() => {
    console.log("WebSocket server closed")
    process.exit(0)
  })
})

process.on("SIGINT", () => {
  console.log("Shutting down WebSocket server...")
  wss.close(() => {
    console.log("WebSocket server closed")
    process.exit(0)
  })
})
