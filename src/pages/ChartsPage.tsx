import { useState } from 'react'
import { Link } from 'react-router-dom'
import './ChartsPage.css'

const mockConversations = [
  { id: 1, name: 'John Niyonzima', farmerId: 'F001', time: '10:32 AM', snippet: 'Morning! I will deliver 120kg today.', unread: 3, online: true },
  { id: 2, name: 'Marie Claire Uwimana', farmerId: 'F002', time: '9:15 AM', snippet: 'Is there any update on last week delivery?', unread: 0, online: true },
  { id: 3, name: 'Patrick Habimana', farmerId: 'F003', time: 'Yesterday', snippet: 'Thanks for the quick response.', unread: 0, online: false },
  { id: 4, name: 'Emmanuel Nkundiye', farmerId: 'F004', time: 'Yesterday', snippet: 'I need to change my delivery schedule.', unread: 1, online: false },
  { id: 5, name: 'Alice Mukamana', farmerId: 'F005', time: 'Mon', snippet: 'Quality test results are attached.', unread: 0, online: true },
  { id: 6, name: 'Samuel Ndayisaba', farmerId: 'F006', time: 'Mon', snippet: 'Payment received. Thank you.', unread: 0, online: false }
]

const mockContacts = [
  { name: 'James Manager', role: 'Manager', online: true },
  { name: 'John Niyonzima', role: 'Farmer', online: true },
  { name: 'Marie Claire U.', role: 'Farmer', online: false },
  { name: 'Patrick H.', role: 'Farmer', online: false },
  { name: 'Admin Support', role: 'Support', online: true }
]

const mockAnnouncements = [
  { id: 1, title: 'Quality Test Training', desc: 'Join the mandatory quality testing session this Friday at 9 AM.', date: 'May 10, 2025', color: '#8b5cf6' },
  { id: 2, title: 'Price Update', desc: 'Milk price has been updated to 320 RWF per liter.', date: 'May 12, 2025', color: '#22c55e' },
  { id: 3, title: 'Payment Schedule', desc: 'All pending payments will be processed on Thursday.', date: 'May 14, 2025', color: '#f97316' },
  { id: 4, title: 'System Maintenance', desc: 'The system will be down for maintenance on Sunday.', date: 'May 16, 2025', color: '#ef4444' }
]

const mockMessages = [
  { from: 'them', text: 'Good morning! I have 120kg ready for delivery.', time: '9:00 AM' },
  { from: 'me', text: 'Great, I will update the schedule.', time: '9:05 AM' },
  { from: 'them', text: 'Also, can you confirm the price for today?', time: '9:12 AM' },
  { from: 'me', text: 'Yes, it is 320 RWF per liter.', time: '9:15 AM' },
  { from: 'them', text: 'Morning! I will deliver 120kg today.', time: '10:32 AM' }
]

export const ChartsPage = () => {
  const [activeChat, setActiveChat] = useState(mockConversations[0])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [message, setMessage] = useState('')
  const [chatMessages, setChatMessages] = useState(mockMessages)

  const sendMessage = () => {
    if (!message.trim()) return
    setChatMessages([...chatMessages, { from: 'me', text: message, time: 'Just now' }])
    setMessage('')
  }

  const filteredConversations = mockConversations.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'All' || (filter === 'Unread' ? c.unread > 0 : true)
    return matchesSearch && matchesFilter
  })

  return (
    <div className="comm-page">
      <header className="comm-header">
        <div className="comm-header-left">
          <button className="comm-menu-btn">☰</button>
          <div>
            <h2 className="comm-title">Communication</h2>
            <p className="comm-subtitle">Connect with farmers and managers</p>
          </div>
        </div>
        <div className="comm-header-right">
          <div className="comm-notif-wrap">
            <button className="comm-notif-btn">🔔</button>
            <span className="comm-badge">5</span>
          </div>
          <div className="comm-user">
            <div className="comm-avatar-sm">JO</div>
            <div className="comm-user-info">
              <span className="comm-user-name">James Operator</span>
              <span className="comm-user-role">Operator</span>
            </div>
            <span className="comm-chevron">▾</span>
          </div>
        </div>
      </header>

      <div className="comm-body">
        <aside className="comm-sidebar">
          <div className="conv-header">
            <h3>Conversations</h3>
            <button className="btn-new-message">+ New Message</button>
          </div>
          <div className="conv-controls">
            <div className="search-box">
              <span>🔍</span>
              <input
                type="text"
                placeholder="Search conversations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="conv-filters">
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option>All</option>
                <option>Unread</option>
              </select>
              <button className="icon-btn">⚙</button>
            </div>
          </div>
          <ul className="conv-list">
            {filteredConversations.map((c) => (
              <li
                key={c.id}
                className={`conv-item ${activeChat?.id === c.id ? 'active' : ''}`}
                onClick={() => setActiveChat(c)}
              >
                <div className="conv-avatar-wrap">
                  <div className="conv-avatar">{c.name.charAt(0)}</div>
                  <span className={`status-dot ${c.online ? 'online' : 'offline'}`}></span>
                </div>
                <div className="conv-meta">
                  <div className="conv-top">
                    <span className="conv-name">{c.name}</span>
                    <span className="conv-time">{c.time}</span>
                  </div>
                  <div className="conv-id">{c.farmerId}</div>
                  <div className="conv-bottom">
                    <span className="conv-snippet">{c.snippet}</span>
                    {c.unread > 0 && <span className="conv-badge">{c.unread}</span>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        <section className="comm-chat">
          <div className="chat-header">
            <div className="chat-contact">
              <div className="conv-avatar">{activeChat?.name.charAt(0)}</div>
              <div>
                <div className="chat-name">{activeChat?.name}</div>
                <div className="chat-status online">Online</div>
              </div>
            </div>
            <div className="chat-actions">
              <button className="icon-btn">📞</button>
              <button className="icon-btn">📹</button>
              <button className="icon-btn">ℹ</button>
            </div>
          </div>

          <div className="chat-feed">
            <div className="date-sep">Today</div>
            {chatMessages.map((m, idx) => (
              <div key={idx} className={`chat-row ${m.from === 'me' ? 'outgoing' : 'incoming'}`}>
                {m.from === 'them' && <div className="conv-avatar sm">{activeChat?.name.charAt(0)}</div>}
                <div className="chat-bubble">
                  <p>{m.text}</p>
                  <span className="chat-time">{m.time}</span>
                </div>
                {m.from === 'me' && <div className="read-receipt">✓✓</div>}
              </div>
            ))}
          </div>

          <div className="chat-input-bar">
            <button className="icon-btn">📎</button>
            <input
              type="text"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button className="icon-btn">😊</button>
            <button className="btn-send" onClick={sendMessage}>➤</button>
          </div>
        </section>

        <aside className="comm-aside">
          <div className="panel contacts-panel">
            <div className="panel-header">
              <h3>Contacts</h3>
              <Link to="#" className="link-view-all">View All</Link>
            </div>
            <ul className="contact-list">
              {mockContacts.map((c, i) => (
                <li key={i} className="contact-item">
                  <div className="conv-avatar">{c.name.charAt(0)}</div>
                  <div className="contact-meta">
                    <span className="contact-name">{c.name}</span>
                    <span className="contact-role">{c.role}</span>
                  </div>
                  <span className={`status-dot ${c.online ? 'online' : 'offline'}`}></span>
                </li>
              ))}
            </ul>
          </div>

          <div className="panel announcements-panel">
            <div className="panel-header">
              <h3>Recent Announcements</h3>
              <Link to="#" className="link-view-all">View All</Link>
            </div>
            <div className="ann-list">
              {mockAnnouncements.map((a) => (
                <div key={a.id} className="ann-card">
                  <div className="ann-icon" style={{ background: a.color }}>📢</div>
                  <div className="ann-body">
                    <h4>{a.title}</h4>
                    <p>{a.desc}</p>
                    <span className="ann-date">{a.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
