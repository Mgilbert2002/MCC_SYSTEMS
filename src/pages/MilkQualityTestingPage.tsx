import { API_URL } from '../config/api'
import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { FlaskRound, CheckCircle, Truck } from 'lucide-react'

type TestState = {
  appearance: 'good' | 'bad'
  smell: 'good' | 'bad'
  taste: 'good' | 'bad'
  temperature: number
  lactometer_reading: number
  acidity_value: number
  acidity_test: 'normal' | 'abnormal'
  antibiotic_test: 'negative' | 'positive'
}

type TestField = keyof TestState

const appearanceValues = ['good', 'bad'] as const
const smellValues = ['good', 'bad'] as const
const tasteValues = ['good', 'bad'] as const
const antibioticValues = ['negative', 'positive'] as const

const getAcidityStatus = (value: number) => value >= 6.4 && value <= 6.8 ? 'normal' : 'abnormal'

const calculateSpecificGravity = (lactometerReading: number, temperature: number): number => {
  const L = Number(lactometerReading) || 0
  const T = Number(temperature) || 0
  const base = 1 + L / 1000
  if (T > 15.5) return Number((base + 0.2 * (T - 15.5)).toFixed(3))
  if (T < 15.5) return Number((base - 0.2 * (15.5 - T)).toFixed(3))
  return Number(base.toFixed(3))
}

const getGravityStatus = (sg: number) => sg >= 1.028 && sg <= 1.033 ? 'normal' : 'abnormal'

export const MilkQualityTestingPage = () => {
  const navigate = useNavigate()
  const [selectedDelivery, setSelectedDelivery] = useState('')
  const [deliveries, setDeliveries] = useState<Array<{ delivery_id: number; farmer: string; quantity: number; date: string }>>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [testData, setTestData] = useState<TestState>({
    appearance: 'good',
    smell: 'good',
    taste: 'good',
    temperature: 0,
    lactometer_reading: 0,
    acidity_value: 6.6,
    acidity_test: 'normal',
    antibiotic_test: 'negative'
  })
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const specificGravity = calculateSpecificGravity(testData.lactometer_reading, testData.temperature)
  const specificGravityStatus = getGravityStatus(specificGravity)
  const selectedDeliveryInfo = deliveries.find(d => d.delivery_id.toString() === selectedDelivery)

  useEffect(() => {
    setLoading(true)
    const token = localStorage.getItem('token')
    fetch(`${API_URL}/deliveries`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then((data) => {
        setDeliveries(data.map((d: any) => ({
          delivery_id: d.delivery_id,
          farmer: d.farmer?.user?.full_name || 'Unknown',
          quantity: d.quantity_kg,
          date: d.delivery_date
        })))
      })
      .catch(() => setDeliveries([]))
      .finally(() => setLoading(false))
  }, [])

  const calculateResult = () => {
    return testData.antibiotic_test === 'negative' &&
      testData.appearance === 'good' &&
      testData.smell === 'good' &&
      testData.taste === 'good' &&
      testData.acidity_test === 'normal' &&
      specificGravityStatus === 'normal'
      ? 'pass' : 'fail'
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedDelivery) {
      setError('Please select a delivery')
      return
    }
    const organolepticResult = calculateResult()
    const payload = {
      delivery_id: Number(selectedDelivery),
      appearance: testData.appearance,
      smell: testData.smell,
      taste: testData.taste,
      temperature: testData.temperature,
      lactometer_reading: testData.lactometer_reading,
      acidity_test: testData.acidity_test,
      antibiotic_test: testData.antibiotic_test,
      organoleptic_result: organolepticResult
    }
    
    try {
      setSubmitting(true)
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/quality`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
      
      if (!res.ok) {
        const body = await res.text()
        throw new Error(`Save failed (${res.status}): ${body}`)
      }
      setSuccess(true)
      setTestData({
        appearance: 'good',
        smell: 'good',
        taste: 'good',
        temperature: 0,
        lactometer_reading: 0,
        acidity_value: 6.6,
        acidity_test: 'normal',
        antibiotic_test: 'negative'
      })
      setSelectedDelivery('')
      setTimeout(() => {
        setSuccess(false)
        navigate('/operator/quality/results')
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save test results')
    } finally {
      setSubmitting(false)
    }
  }

  const updateField = (field: TestField, value: string | number) => {
    if (field === 'acidity_value') {
      const acidityValue = Number(value)
      setTestData({ ...testData, acidity_value: acidityValue, acidity_test: getAcidityStatus(acidityValue) })
      return
    }

    setTestData({ ...testData, [field]: value })
  }

  return (
    <div className="new-delivery-page">
      <div className="new-delivery-header">
        <div className="new-delivery-header-icon">
          <FlaskRound size={32} />
        </div>
        <div>
          <h1>Milk Quality Testing</h1>
          <p>Record quality test results for milk deliveries</p>
        </div>
      </div>

      {error && <div className="new-delivery-alert error"><CheckCircle size={18} /> {error}</div>}
      {success && <div className="new-delivery-alert success"><CheckCircle size={18} /> Quality test saved successfully! Redirecting...</div>}

      <form onSubmit={handleSubmit} className="new-delivery-form">
        <div className="new-delivery-section">
          <h3><Truck size={18} /> Select Delivery</h3>
          <div className="new-delivery-grid">
            <div className="form-group">
              <label>Delivery</label>
              <select 
                value={selectedDelivery} 
                onChange={(e) => setSelectedDelivery(e.target.value)} 
                disabled={loading}
                required
              >
                <option value="">{loading ? 'Loading deliveries...' : 'Select a delivery'}</option>
                {deliveries.map((d) => (
                  <option key={d.delivery_id} value={d.delivery_id.toString()}>
                    {d.farmer} - {d.quantity}kg ({d.date})
                  </option>
                ))}
              </select>
              {selectedDeliveryInfo && (
                <p className="text-xs text-gray-500 mt-1">Farmer: {selectedDeliveryInfo.farmer}, Quantity: {selectedDeliveryInfo.quantity}kg, Date: {selectedDeliveryInfo.date}</p>
              )}
            </div>
          </div>
        </div>

        <div className="new-delivery-section">
          <h3><FlaskRound size={18} /> Sensory Tests</h3>
          <div className="new-delivery-grid">
            <div className="form-group">
              <label>Appearance</label>
              <select value={testData.appearance} onChange={(e) => updateField('appearance', e.target.value)}>
                {appearanceValues.map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Smell</label>
              <select value={testData.smell} onChange={(e) => updateField('smell', e.target.value)}>
                {smellValues.map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Taste</label>
              <select value={testData.taste} onChange={(e) => updateField('taste', e.target.value)}>
                {tasteValues.map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="new-delivery-section">
          <h3><FlaskRound size={18} /> Physical Tests</h3>
          <div className="new-delivery-grid">
            <div className="form-group">
              <label>Lactometer Reading</label>
              <input type="number" step="0.01" value={testData.lactometer_reading} onChange={(e) => updateField('lactometer_reading', parseFloat(e.target.value) || 0)} required />
            </div>
            <div className="form-group">
              <label>Temperature (°C)</label>
              <input type="number" step="0.01" value={testData.temperature} onChange={(e) => updateField('temperature', parseFloat(e.target.value) || 0)} required />
            </div>
            <div className="form-group">
              <label>Specific Gravity</label>
              <span className={`status ${specificGravityStatus}`}>{specificGravity.toFixed(3)} ({specificGravityStatus.toUpperCase()})</span>
            </div>
            <div className="form-group">
              <label>Acidity Test</label>
              <input
                type="number"
                step="0.01"
                value={testData.acidity_value}
                onChange={(e) => updateField('acidity_value', parseFloat(e.target.value) || 0)}
                required
              />
              <p className={testData.acidity_test === 'abnormal' ? 'text-red-600 font-bold' : 'field-success'}>
                Acidity Status: <strong>{testData.acidity_test.toUpperCase()}</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="new-delivery-section">
          <h3><FlaskRound size={18} /> Chemical Tests</h3>
          <div className="new-delivery-grid">
            <div className="form-group">
              <label>Antibiotic Test</label>
              <select value={testData.antibiotic_test} onChange={(e) => updateField('antibiotic_test', e.target.value)}>
                {antibioticValues.map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="new-delivery-summary">
          <h4>Quality Test Result</h4>
          <div className="summary-row">
            <span>Organoleptic Result:</span>
            <span className={`font-bold ${calculateResult() === 'pass' ? 'text-green-600' : 'text-red-600'}`}>
              {calculateResult().toUpperCase()}
            </span>
          </div>
        </div>

        <div className="new-delivery-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate('/operator')}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Test Results'}
          </button>
        </div>
      </form>
    </div>
  )
}
