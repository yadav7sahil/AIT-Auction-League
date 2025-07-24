import type { NextRequest } from "next/server"
import { WebSocketServer } from "ws"

let wss: WebSocketServer | null = null

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  if (searchParams.get("upgrade") === "websocket") {
    // Handle WebSocket upgrade
    if (!wss) {
      const port = process.env.WS_PORT ? Number.parseInt(process.env.WS_PORT) : 8080
      wss = new WebSocketServer({ port })

      wss.on("connection", (ws, req) => {
        console.log("New WebSocket connection from:", req.socket.remoteAddress)

        // Send welcome message
        ws.send(
          JSON.stringify({
            type: "connected",
            message: "Connected to auction WebSocket",
          }),
        )

        ws.on("message", async (message) => {
          try {
            const data = JSON.parse(message.toString())
            console.log("Received WebSocket message:", data)

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
                const bidData = {
                  type: "new_bid",
                  data: data.bid,
                }

                wss?.clients.forEach((client) => {
                  if (client.readyState === 1) {
                    // WebSocket.OPEN
                    client.send(JSON.stringify(bidData))
                  }
                })
                break

              case "auction_update":
                // Broadcast auction updates
                const updateData = {
                  type: "auction_update",
                  data: data.auction,
                }

                wss?.clients.forEach((client) => {
                  if (client.readyState === 1) {
                    client.send(JSON.stringify(updateData))
                  }
                })
                break

              case "auction_ended":
                // Broadcast auction end
                const endData = {
                  type: "auction_ended",
                  data: data.auction,
                }

                wss?.clients.forEach((client) => {
                  if (client.readyState === 1) {
                    client.send(JSON.stringify(endData))
                  }
                })
                break
            }
          } catch (error) {
            console.error("Error handling WebSocket message:", error)
            ws.send(
              JSON.stringify({
                type: "error",
                message: "Invalid message format",
              }),
            )
          }
        })

        ws.on("close", () => {
          console.log("WebSocket connection closed")
        })

        ws.on("error", (error) => {
          console.error("WebSocket error:", error)
        })
      })

      console.log(`WebSocket server started on port ${port}`)
    }

    return new Response("WebSocket server running", {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    })
  }

  return new Response("WebSocket upgrade required", { status: 400 })
}
