import type { NextRequest } from "next/server"
import { WebSocketServer } from "ws"

// WebSocket server for real-time auction updates
let wss: WebSocketServer | null = null

export async function GET(request: NextRequest) {
  if (!wss) {
    wss = new WebSocketServer({ port: 8080 })

    wss.on("connection", (ws) => {
      console.log("New WebSocket connection")

      ws.on("message", (message) => {
        try {
          const data = JSON.parse(message.toString())

          // Handle different message types
          switch (data.type) {
            case "join_auction":
              ws.send(
                JSON.stringify({
                  type: "joined",
                  message: "Successfully joined auction room",
                }),
              )
              break

            case "place_bid":
              // Broadcast bid to all connected clients
              wss?.clients.forEach((client) => {
                if (client.readyState === 1) {
                  // WebSocket.OPEN
                  client.send(
                    JSON.stringify({
                      type: "new_bid",
                      data: data.bid,
                    }),
                  )
                }
              })
              break

            case "auction_update":
              // Broadcast auction updates
              wss?.clients.forEach((client) => {
                if (client.readyState === 1) {
                  client.send(
                    JSON.stringify({
                      type: "auction_update",
                      data: data.auction,
                    }),
                  )
                }
              })
              break
          }
        } catch (error) {
          console.error("Error handling WebSocket message:", error)
        }
      })

      ws.on("close", () => {
        console.log("WebSocket connection closed")
      })
    })
  }

  return new Response("WebSocket server running on port 8080", { status: 200 })
}
