import { API_URL } from '../config/api'
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FlaskRound, CheckCircle } from 'lucide-react'

export const AcceptDeliveryPage = () => {
  const { deliveryId } = useParams<{ deliveryId: string }>()
  const navigate = useNavigate()
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('1500')
  const [totalCost, setTotalCost] = useState(0)
  const [paymentStatus, setPaymentStatus] = useState('not_paid')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const q = parseFloat(quantity) || 0
    const p = parseFloat(price) || 0
    setTotalCost(Number((q * p).toFixed(2)))
  }, [quantity, price])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!deliveryId) return
    setError('')
    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const status = paymentStatus === 'paid' ? 'paid' : 'unpaid'
      const res = await fetch(`${API_URL}/deliveries/${deliveryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          unit_price: parseFloat(price),
          total_cost: totalCost,
          payment_status: status,
          status: 'accepted'
        })
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Failed to update delivery')
      }
      
      const testRes = await fetch(`${API_URL}/quality/${deliveryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const test = await testRes.json()
      if (test && test.quality_test_id) {
        await fetch(`${API_URL}/quality/${test.quality_test_id}/decision`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ final_decision: 'accepted' })
        })
      }
      
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        navigate('/operator/quality/results')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save acceptance')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="new-delivery-page">
      <div className="new-delivery-header">
        <div className="new-delivery-header-icon">
          <CheckCircle size={32} />
        </div>
        <div>
          <h1>Accept Quality Test Result</h1>
          <p>Record delivery acceptance and cost details</p>
        </div>
      </div>

      {error && <div className="new-delivery-alert error"><CheckCircle size={18} /> {error}</div>}
      {success && <div className="new-delivery-alert success"><CheckCircle size={18} /> Acceptance saved! Redirecting...</div>}

      <form onSubmit={handleSubmit} className="new-delivery-form">
        <div className="new-delivery-section">
          <h3><FlaskRound size={18} /> Acceptance Details</h3>
          <div className="new-delivery-grid">
            <div className="form-group">
              <label>Milk Quantity (L/KG)</label>
              <input
                type="number"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
                required
              />
            </div>
            <div className="form-group">
              <label>Cost Per Liter (RWF)</label>
              <input
                type="number"
                step="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Default price"
                required
              />
            </div>
            <div className="form-group">
              <label>Total Cost (RWF)</label>
              <span className="readonly-field" style={{ background: '#f0fdf4', color: '#15803d', fontWeight: 700 }}>
                {totalCost.toLocaleString()} RWF
              </span>
            </div>
            <div className="form-group">
              <label>Payment Status</label>
              <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
                <option value="not_paid">Not Paid</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>
        </div>

        <div className="new-delivery-summary">
          <h4>Acceptance Summary</h4>
          <div className="summary-row">
            <span>Delivery ID:</span>
            <span>#{deliveryId}</span>
          </div>
          <div className="summary-row">
            <span>Quantity:</span>
            <span>{quantity || '0'} L/KG</span>
          </div>
          <div className="summary-row">
            <span>Unit Price:</span>
            <span>{Number(price).toLocaleString()} RWF</span>
          </div>
          <div className="summary-row total">
            <span>Total Cost:</span>
            <span>{totalCost.toLocaleString()} RWF</span>
          </div>
        </div>

        <div className="new-delivery-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate('/operator/quality/results')}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : 'Confirm Acceptance'}
          </button>
        </div>
      </form>
    </div>
  )
}
