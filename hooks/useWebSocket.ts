"use client"

import { useEffect, useRef, useState } from "react"
import { AuctionWebSocket } from "@/lib/websocket"

interface UseWebSocketOptions {
  onMessage?: (data: any) => void
  onError?: (error: Event) => void
  autoConnect?: boolean
}

export function useWebSocket(url: string, options: UseWebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<AuctionWebSocket | null>(null)

  const { onMessage, onError, autoConnect = true } = options

  useEffect(() => {
    if (!autoConnect) return

    const ws = new AuctionWebSocket(url)
    wsRef.current = ws

    ws.connect(
      (data) => {
        setIsConnected(true)
        setError(null)
        if (onMessage) onMessage(data)
      },
      (error) => {
        setIsConnected(false)
        setError("Connection failed")
        if (onError) onError(error)
      },
    )

    return () => {
      ws.disconnect()
      wsRef.current = null
    }
  }, [url, autoConnect, onMessage, onError])

  const sendMessage = (data: any) => {
    if (wsRef.current) {
      wsRef.current.send(data)
    }
  }

  const connect = () => {
    if (!wsRef.current) {
      const ws = new AuctionWebSocket(url)
      wsRef.current = ws
      ws.connect(
        (data) => {
          setIsConnected(true)
          setError(null)
          if (onMessage) onMessage(data)
        },
        (error) => {
          setIsConnected(false)
          setError("Connection failed")
          if (onError) onError(error)
        },
      )
    }
  }

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.disconnect()
      wsRef.current = null
      setIsConnected(false)
    }
  }

  return {
    isConnected,
    error,
    sendMessage,
    connect,
    disconnect,
  }
}
