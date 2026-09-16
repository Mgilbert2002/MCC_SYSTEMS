import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { FlaskRound, CheckCircle, XCircle, Check, X } from 'lucide-react'

const calculateSpecificGravity = (lactometerReading: number, temperature: number): number => {
  const L = Number(lactometerReading) || 0
  const T = Number(temperature) || 0
  const base = 1 + L / 1000
  if (T > 15.5) return Number((base + 0.2 * (T - 15.5)).toFixed(3))
  if (T < 15.5) return Number((base - 0.2 * (15.5 - T)).toFixed(3))
  return Number(base.toFixed(3))
}

const getGravityStatus = (sg: number) => sg >= 1.028 && sg <= 1.033 ? 'normal' : 'abnormal'

const allTestsPass = (test: any): boolean => {
  if (!test) return false
  const gravity = calculateSpecificGravity(test.lactometer_reading, test.temperature)
  return (
    test.appearance === 'good' &&
    test.smell === 'good' &&
    test.taste === 'good' &&
    test.acidity_test === 'normal' &&
    test.antibiotic_test === 'negative' &&
    gravity >= 1.028 && gravity <= 1.033 &&
    test.organoleptic_result === 'pass'
  )
}

export const QualityResultsPage = () => {
  const navigate = useNavigate()
  const [tests, setTests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [decisionSubmitting, setDecisionSubmitting] = useState<Record<number, boolean>>({})
  const [decisionError, setDecisionError] = useState<string | null>(null)

  const loadTests = useCallback(() => {
    setLoading(true)
    api.quality.getAll()
      .then((data) => {
        const arr = Array.isArray(data) ? data : []
        arr.sort((a, b) => new Date(b.tested_at).getTime() - new Date(a.tested_at).getTime())
        setTests(arr)
      })
      .catch(() => setTests([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadTests()
  }, [loadTests])

  const formatDate = (date: string) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const latest = tests.length > 0 ? tests[0] : null
  const passed = tests.filter(t => t.organoleptic_result === 'pass').length
  const rejected = tests.filter(t => t.organoleptic_result === 'fail').length

  const handleDecision = async (testId: number, decision: 'accepted' | 'rejected') => {
    const test = tests.find(t => t.quality_test_id === testId)
    if (decision === 'accepted' && !allTestsPass(test)) {
      setDecisionError('All quality tests must pass before acceptance')
      return
    }
    if (decision === 'accepted') {
      navigate(`/operator/quality/accept/${test?.delivery_id}`)
      return
    }
    setDecisionSubmitting((s) => ({ ...s, [testId]: true }))
    setDecisionError(null)
    try {
      const updated = await (api.quality as any).setDecision(testId, { final_decision: decision })
      setTests((prev) => prev.map((t) => (t.quality_test_id === testId ? { ...t, ...updated } : t)))
    } catch (e) {
      setDecisionError('Failed to update decision')
    } finally {
      setDecisionSubmitting((s) => ({ ...s, [testId]: false }))
    }
  }

  return (
    <div className="new-delivery-page">
      <div className="new-delivery-header">
        <div className="new-delivery-header-icon">
          <FlaskRound size={32} />
        </div>
        <div>
          <h1>Quality Test Results</h1>
          <p>View all milk quality test records</p>
        </div>
      </div>

      <div className="new-delivery-summary">
        <h4>Overview</h4>
        <div className="summary-row">
          <span>Total Tests:</span>
          <span>{tests.length}</span>
        </div>
        <div className="summary-row">
          <span>Passed:</span>
          <span style={{ color: '#16a34a', fontWeight: 600 }}>{passed}</span>
        </div>
        <div className="summary-row total">
          <span>Rejected:</span>
          <span style={{ color: '#dc2626', fontWeight: 600 }}>{rejected}</span>
        </div>
      </div>

      {decisionError && <div style={{ marginBottom: '12px', color: '#dc2626' }}>{decisionError}</div>}

      {latest && !loading && (
        <div className="new-delivery-section latest-result-banner">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0 }}>Latest Result (Test #{latest.quality_test_id})</h3>
            <span className={`status ${allTestsPass(latest) && latest.final_decision === 'accepted' ? 'accepted' : latest.final_decision || 'pending'}`} style={{ fontSize: '13px', fontWeight: 600 }}>
              {latest.final_decision?.toUpperCase() || 'PENDING'}
            </span>
          </div>
          <div className="new-delivery-grid">
            <div className="form-group">
              <label>Delivery ID</label>
              <span className="readonly-field">{latest.delivery_id}</span>
            </div>
            <div className="form-group">
              <label>Appearance</label>
              <span className={`status ${latest.appearance}`}>{latest.appearance}</span>
            </div>
            <div className="form-group">
              <label>Smell</label>
              <span className={`status ${latest.smell}`}>{latest.smell}</span>
            </div>
            <div className="form-group">
              <label>Taste</label>
              <span className={`status ${latest.taste}`}>{latest.taste}</span>
            </div>
            <div className="form-group">
              <label>Temperature (°C)</label>
              <span className="readonly-field">{latest.temperature}</span>
            </div>
            <div className="form-group">
              <label>Lactometer Reading</label>
              <span className="readonly-field">{latest.lactometer_reading}</span>
            </div>
            <div className="form-group">
              <label>Specific Gravity</label>
              <span className={`status ${getGravityStatus(calculateSpecificGravity(latest.lactometer_reading, latest.temperature))}`}>
                {calculateSpecificGravity(latest.lactometer_reading, latest.temperature).toFixed(3)} ({getGravityStatus(calculateSpecificGravity(latest.lactometer_reading, latest.temperature)).toUpperCase()})
              </span>
            </div>
            <div className="form-group">
              <label>Acidity Test</label>
              <span className={`status ${latest.acidity_test}`}>{latest.acidity_test}</span>
            </div>
            <div className="form-group">
              <label>Antibiotic Test</label>
              <span className={`status ${latest.antibiotic_test}`}>{latest.antibiotic_test}</span>
            </div>
            <div className="form-group">
              <label>Organoleptic Result</label>
              <span className={`status ${latest.organoleptic_result}`}>
                {latest.organoleptic_result === 'pass' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                {latest.organoleptic_result?.toUpperCase()}
              </span>
            </div>
            <div className="form-group">
              <label>Decision</label>
              <div className="decision-actions">
                <button type="button" className="accept-btn" onClick={() => handleDecision(latest.quality_test_id, 'accepted')} disabled={!!decisionSubmitting[latest.quality_test_id] || !allTestsPass(latest)}>
                  <Check size={16} />
                  Accept
                </button>
                <button type="button" className="reject-btn" onClick={() => handleDecision(latest.quality_test_id, 'rejected')} disabled={!!decisionSubmitting[latest.quality_test_id]}>
                  <X size={16} />
                  Reject
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>Tested At</label>
              <span className="readonly-field">{formatDate(latest.tested_at)}</span>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="new-delivery-section">
          <p style={{ textAlign: 'center' }}>Loading...</p>
        </div>
      ) : tests.length === 0 ? (
        <div className="new-delivery-section">
          <p style={{ textAlign: 'center' }}>No quality tests found</p>
        </div>
      ) : (
        tests.slice(1).map((t: any) => {
          const gravity = calculateSpecificGravity(t.lactometer_reading, t.temperature)
          const gravityStatus = getGravityStatus(gravity)
          return (
            <div key={t.quality_test_id} className="new-delivery-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0 }}>Test #{t.quality_test_id}</h3>
                <span className={`status ${allTestsPass(t) && t.final_decision === 'accepted' ? 'accepted' : t.final_decision || 'pending'}`} style={{ fontSize: '13px', fontWeight: 600 }}>
                  {t.final_decision?.toUpperCase() || 'PENDING'}
                </span>
              </div>

              <div className="new-delivery-grid">
                <div className="form-group">
                  <label>Delivery ID</label>
                  <span className="readonly-field">{t.delivery_id}</span>
                </div>
                <div className="form-group">
                  <label>Appearance</label>
                  <span className={`status ${t.appearance}`}>{t.appearance}</span>
                </div>
                <div className="form-group">
                  <label>Smell</label>
                  <span className={`status ${t.smell}`}>{t.smell}</span>
                </div>
                <div className="form-group">
                  <label>Taste</label>
                  <span className={`status ${t.taste}`}>{t.taste}</span>
                </div>
                <div className="form-group">
                  <label>Temperature (°C)</label>
                  <span className="readonly-field">{t.temperature}</span>
                </div>
                <div className="form-group">
                  <label>Lactometer Reading</label>
                  <span className="readonly-field">{t.lactometer_reading}</span>
                </div>
                <div className="form-group">
                  <label>Specific Gravity</label>
                  <span className={`status ${gravityStatus}`}>{gravity.toFixed(3)} ({gravityStatus.toUpperCase()})</span>
                </div>
                <div className="form-group">
                  <label>Acidity Test</label>
                  <span className={`status ${t.acidity_test}`}>{t.acidity_test}</span>
                </div>
                <div className="form-group">
                  <label>Antibiotic Test</label>
                  <span className={`status ${t.antibiotic_test}`}>{t.antibiotic_test}</span>
                </div>
                <div className="form-group">
                  <label>Organoleptic Result</label>
                  <span className={`status ${t.organoleptic_result}`}>
                    {t.organoleptic_result === 'pass' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    {t.organoleptic_result?.toUpperCase()}
                  </span>
                </div>
                <div className="form-group">
                  <label>Decision</label>
                  <div className="decision-actions">
                    <button type="button" className="accept-btn" onClick={() => handleDecision(t.quality_test_id, 'accepted')} disabled={!!decisionSubmitting[t.quality_test_id] || !allTestsPass(t)}>
                      <Check size={16} />
                      Accept
                    </button>
                    <button type="button" className="reject-btn" onClick={() => handleDecision(t.quality_test_id, 'rejected')} disabled={!!decisionSubmitting[t.quality_test_id]}>
                      <X size={16} />
                      Reject
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label>Tested At</label>
                  <span className="readonly-field">{formatDate(t.tested_at)}</span>
                </div>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}