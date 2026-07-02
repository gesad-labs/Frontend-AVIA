import { Client } from '@stomp/stompjs'
import { getToken } from './api'

const WS_URL = 'ws://localhost:8080/ws'

export function createPokerClient({ onConnect, onDisconnect } = {}) {
  return new Client({
    brokerURL: WS_URL,
    connectHeaders: {
      Authorization: `Bearer ${getToken()}`,
    },
    reconnectDelay: 5000,
    onConnect: onConnect ?? (() => {}),
    onDisconnect: onDisconnect ?? (() => {}),
    onStompError: frame => {
      console.error('STOMP error', frame)
    },
  })
}
