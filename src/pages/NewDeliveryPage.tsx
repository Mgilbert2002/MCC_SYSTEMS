import { API_URL } from '../config/api'
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Truck, User, MapPin, Weight, Calendar, Clock, FileText, CheckCircle } from 'lucide-react'

export const NewDeliveryPage = () => {
  const navigate = useNavigate()
  const { user, userData } = useAuth()
  const [formData, setFormData] = useState({
    farmer_id: '',
    farmer_name: '',
    farmer_code: '',
    delivery_person: '',
    quantity_kg: '',
    unit_price: '',
    delivery_date: new Date().toISOString().split('T')[0],
    delivery_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
    notes: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const lookupTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const lookupFarmer = async (code: string) => {
    if (!code) {
      setFormData(prev => ({ ...prev, farmer_id: '', farmer_name: '' }))
      return
    }
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/farmers?code=${encodeURIComponent(code)}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to look up farmer')
      const farmer = Array.isArray(data) ? data[0] : data
      if (farmer) {
        setFormData(prev => ({
          ...prev,
          farmer_id: String(farmer.farmer_id || farmer.user?.user_id || ''),
          farmer_name: String(farmer.user?.full_name || farmer.name || ''),
          farmer_code: String(farmer.farmer_code || code)
        }))
      }
    } catch (err) {
      console.error('Farmer lookup failed:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const token = localStorage.getItem('token')
      const payload = {
        farmer_id: Number(formData.farmer_id),
        operator_id: (userData as any)?.operator_id ?? user?.user_id,
        delivery_person: formData.delivery_person,
        quantity_kg: Number(formData.quantity_kg),
        unit_price: Number(formData.unit_price),
        delivery_date: formData.delivery_date,
        delivery_time: formData.delivery_time,
        notes: formData.notes
      }

      const res = await fetch(`${API_URL}/deliveries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to record delivery')

      setSuccess(true)
      setFormData({
        farmer_id: '',
        farmer_name: '',
        farmer_code: '',
        delivery_person: '',
        quantity_kg: '',
        unit_price: '',
        delivery_date: new Date().toISOString().split('T')[0],
        delivery_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        notes: ''
      })
      setTimeout(() => {
        setSuccess(false)
        navigate('/operator/quality')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record delivery')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="new-delivery-page">
      <div className="new-delivery-header">
        <div className="new-delivery-header-icon">
          <Truck size={32} />
        </div>
        <div>
          <h1>New Milk Delivery</h1>
          <p>Record a new milk delivery from a farmer</p>
        </div>
      </div>

      {error && <div className="new-delivery-alert error"><CheckCircle size={18} /> {error}</div>}
      {success && <div className="new-delivery-alert success"><CheckCircle size={18} /> Delivery recorded successfully! Redirecting to quality testing...</div>}

      <form onSubmit={handleSubmit} className="new-delivery-form">
        <div className="new-delivery-section">
          <h3><User size={18} /> Farmer Information</h3>
          <div className="new-delivery-grid">
             <div className="form-group">
               <label><MapPin size={16} /> Farmer Code</label>
                <input
                  type="text"
                  value={formData.farmer_code}
                  onChange={(e) => {
                    const val = e.target.value
                    setFormData({ ...formData, farmer_code: val })
                    if (lookupTimeout.current) clearTimeout(lookupTimeout.current)
                    lookupTimeout.current = setTimeout(() => lookupFarmer(val), 300)
                  }}
                  placeholder="e.g., FARM2"
                  required
                />
             </div>
             <div className="form-group">
               <label><User size={16} /> Farmer Name</label>
               <input
                 type="text"
                 value={formData.farmer_name}
                 onChange={(e) => setFormData({ ...formData, farmer_name: e.target.value })}
                 placeholder="Farmer full name"
                 required
               />
             </div>
             <div className="form-group">
               <label><FileText size={16} /> Farmer ID</label>
               <input
                 type="number"
                 value={formData.farmer_id}
                 onChange={(e) => setFormData({ ...formData, farmer_id: e.target.value })}
                 placeholder="Numeric ID"
                 required
               />
             </div>
          </div>
        </div>

        <div className="new-delivery-section">
          <h3><Truck size={18} /> Delivery Details</h3>
          <div className="new-delivery-grid">
            <div className="form-group">
              <label><User size={16} /> Delivery Person</label>
              <input
                type="text"
                value={formData.delivery_person}
                onChange={(e) => setFormData({ ...formData, delivery_person: e.target.value })}
                placeholder="Name of person delivering"
                required
              />
            </div>
            <div className="form-group">
              <label><Weight size={16} /> Quantity (KG)</label>
              <input
                type="number"
                step="0.01"
                value={formData.quantity_kg}
                onChange={(e) => setFormData({ ...formData, quantity_kg: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
            <div className="form-group">
              <label><FileText size={16} /> Unit Price (RWF/KG)</label>
              <input
                type="number"
                step="1"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                placeholder="0"
                required
              />
            </div>
          </div>
        </div>

        <div className="new-delivery-section">
          <h3><Calendar size={18} /> Schedule</h3>
          <div className="new-delivery-grid">
            <div className="form-group">
              <label><Calendar size={16} /> Date</label>
              <input
                type="date"
                value={formData.delivery_date}
                onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label><Clock size={16} /> Time</label>
              <input
                type="time"
                value={formData.delivery_time}
                onChange={(e) => setFormData({ ...formData, delivery_time: e.target.value })}
                required
              />
            </div>
          </div>
        </div>

        <div className="new-delivery-section">
          <h3><FileText size={18} /> Additional Notes</h3>
          <div className="form-group full-width">
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes about this delivery..."
              rows={4}
            />
          </div>
        </div>

        <div className="new-delivery-summary">
          <h4>Delivery Summary</h4>
          <div className="summary-row">
            <span>Farmer:</span>
            <span>{formData.farmer_name || '—'}</span>
          </div>
          <div className="summary-row">
            <span>Quantity:</span>
            <span>{formData.quantity_kg || '0'} KG</span>
          </div>
          <div className="summary-row">
            <span>Unit Price:</span>
            <span>{formData.unit_price ? Number(formData.unit_price).toLocaleString() : '0'} RWF</span>
          </div>
          <div className="summary-row total">
            <span>Total Cost:</span>
            <span>
              {formData.quantity_kg && formData.unit_price
                ? (Number(formData.quantity_kg) * Number(formData.unit_price)).toLocaleString()
                : '0'} RWF
            </span>
          </div>
        </div>

        <div className="new-delivery-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate('/operator')}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Recording...' : 'Record Delivery'}
          </button>
        </div>
      </form>
    </div>
  )
}
