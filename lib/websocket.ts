// WebSocket client utility for real-time auction updates
export class AuctionWebSocket {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private isManualClose = false

  constructor(private url: string) {}

  connect(onMessage: (data: any) => void, onError?: (error: Event) => void) {
    try {
      // Don't try to connect if we're manually closing
      if (this.isManualClose) return

      console.log("Attempting WebSocket connection to:", this.url)
      this.ws = new WebSocket(this.url)

      this.ws.onopen = () => {
        console.log("WebSocket connected successfully")
        this.reconnectAttempts = 0

        // Send join message
        this.send({
          type: "join_auction",
          timestamp: new Date().toISOString(),
        })
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log("WebSocket message received:", data)
          onMessage(data)
        } catch (error) {
          console.error("Error parsing WebSocket message:", error)
        }
      }

      this.ws.onclose = (event) => {
        console.log("WebSocket disconnected:", event.code, event.reason)
        if (!this.isManualClose) {
          this.handleReconnect(onMessage, onError)
        }
      }

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error)
        if (onError) onError(error)
      }
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error)
      if (onError) onError(error as Event)
    }
  }

  private handleReconnect(onMessage: (data: any) => void, onError?: (error: Event) => void) {
    if (this.reconnectAttempts < this.maxReconnectAttempts && !this.isManualClose) {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

      setTimeout(() => {
        this.connect(onMessage, onError)
      }, this.reconnectDelay * this.reconnectAttempts)
    } else {
      console.error("Max reconnection attempts reached or manual close")
    }
  }

  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log("Sending WebSocket message:", data)
      this.ws.send(JSON.stringify(data))
      return true
    } else {
      console.warn("WebSocket is not connected, message not sent:", data)
      return false
    }
  }

  disconnect() {
    this.isManualClose = true
    if (this.ws) {
      this.ws.close(1000, "Manual disconnect")
      this.ws = null
    }
    this.reconnectAttempts = 0
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}
