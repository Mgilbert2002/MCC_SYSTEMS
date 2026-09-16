/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import { api } from '../services/api'

export const CommunicationPage = () => {
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')

  useEffect(() => {
    api.messages.getAll().then(setMessages).catch(() => setMessages([]))
  }, [])

  const handleSend = async () => {
    if (newMessage.trim()) {
      const msg = await api.messages.create({ sender_id: 1, receiver_id: 2, message: newMessage })
      setMessages([...messages, msg])
      setNewMessage('')
    }
  }

  return (
    <div className="page">
      <h2>Communication</h2>
      <div className="messages-container">
        {messages.map((msg) => (
          <div key={msg.message_id} className={`message ${msg.status}`}>
            <div className="message-header">
              <strong>{msg.sender?.full_name || 'Unknown'}</strong>
              <span className="time">{msg.sent_at}</span>
            </div>
            <p>{msg.message}</p>
          </div>
        ))}
      </div>
      <div className="message-form">
        <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type your message..." />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  )
}

export const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState<any[]>([])

  useEffect(() => {
    api.announcements.getAll().then(setAnnouncements).catch(() => setAnnouncements([]))
  }, [])

  return (
    <div className="page">
      <h2>Announcements</h2>
      <div className="announcements-list">
        {announcements.map((a) => (
          <div key={a.announcement_id} className="announcement-card">
            <h3>{a.title}</h3>
            <p>{a.message}</p>
            <span className="date">{a.created_at}</span>
          </div>
        ))}
      </div>
    </div>
  )
}