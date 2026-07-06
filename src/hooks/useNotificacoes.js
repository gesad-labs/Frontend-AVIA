import { useState, useEffect, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import { api, getToken } from '../services/api'

export function useNotificacoes(projetoId) {
  const [notificacoes, setNotificacoes] = useState([])

  // Initial REST fetch
  useEffect(() => {
    if (!projetoId) { setNotificacoes([]); return }
    api.get(`/projetos/${projetoId}/notificacoes`)
      .then(data => setNotificacoes(Array.isArray(data) ? data : []))
      .catch(err => console.error('[useNotificacoes] REST fetch falhou:', err))
  }, [projetoId])

  // WebSocket real-time
  useEffect(() => {
    if (!projetoId) return
    const client = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      connectHeaders: { Authorization: `Bearer ${getToken()}` },
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(
          `/user/queue/projetos/${projetoId}/notificacoes`,
          msg => {
            try {
              const notif = JSON.parse(msg.body)
              setNotificacoes(prev => [notif, ...prev])
            } catch {}
          }
        )
      },
    })
    client.activate()
    return () => { client.deactivate() }
  }, [projetoId])

  const marcarLida = useCallback(async (notifId) => {
    try {
      await api.patch(`/projetos/${projetoId}/notificacoes/${notifId}/lida`)
      setNotificacoes(prev =>
        prev.map(n => n.id === notifId ? { ...n, lida: true } : n)
      )
    } catch {}
  }, [projetoId])

  const unreadCount = notificacoes.filter(n => !n.lida).length

  return { notificacoes, unreadCount, marcarLida }
}
