import { useState, useEffect } from 'react'
import { api } from '../services/api'
import './MilkTankPage.css'

export const MilkTankPage = () => {
  const [tankData, setTankData] = useState<{ current_quantity: number; capacity: number; percentage: number; status: string }>({ current_quantity: 0, capacity: 15000, percentage: 0, status: 'low' })
  const [received, setReceived] = useState(0)
  const [sold, setSold] = useState(0)

  useEffect(() => {
    Promise.all([
      api.tank.get().catch(() => ({ current_quantity: 0, capacity: 15000, percentage: 0, status: 'low' })),
      api.deliveries.getAll().catch(() => []),
      api.sales.getAll().catch(() => [])
    ]).then(([tank, deliveries, sales]) => {
      setTankData({
        current_quantity: Number(tank.current_quantity || 0),
        capacity: Number(tank.capacity || 15000),
        percentage: Number(tank.percentage ?? 0),
        status: tank.status || 'low'
      })

      const totalReceived = (deliveries as any[]).reduce((sum, d) => sum + (Number(d.quantity_kg) || 0), 0)
      const totalSold = (sales as any[]).filter((s: any) => s.product?.unit === 'L').reduce((sum: number, s: any) => sum + (Number(s.quantity) || 0), 0)
      setReceived(totalReceived)
      setSold(totalSold)
    }).catch(() => {
      setTankData({ current_quantity: 0, capacity: 15000, percentage: 0, status: 'low' })
    })
  }, [])

  const currentVolume = tankData.current_quantity
  const maxCapacity = tankData.capacity
  const fillPercentage = Number.isFinite(tankData.percentage) ? tankData.percentage : (maxCapacity > 0 ? (currentVolume / maxCapacity) * 100 : 0)
  const levelLabel = tankData.status.charAt(0).toUpperCase() + tankData.status.slice(1)

  return (
    <div className="milk-tank-page">
      <div className="milk-tank-container">
        <div className="info-panel left-panel">
          <div className="info-card">
            <h3>Quantity of Received Milk</h3>
            <p className="info-value">{received.toLocaleString()} L</p>
          </div>
          {/* <div className="info-card description-card">
            <p>
              When milk is received automatically, the volume of milk in the tank increases.
            </p>
          </div> */}
        </div>

        <div className="tank-section">
          <svg
            className="curved-arrow incoming"
            viewBox="0 0 240 140"
            width="240"
            height="140"
          >
            <path
              d="M 10 70 Q 100 20, 160 70"
              fill="none"
              stroke="#2563eb"
              strokeWidth="4"
              strokeLinecap="round"
              markerEnd="url(#arrowhead)"
            />
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#2563eb" />
              </marker>
            </defs>
          </svg>

           <div className="tank-wrapper" style={{  }}>
             <div className="tank">
               <div className="tank-top"></div>
              <div className="tank-body">
                <div className="tank-fill" style={{ height: `${fillPercentage}%` }} />
                <div className="tank-label">
                  <span className="tank-label-title">Milk Tank</span>
                  <span className="tank-label-sub">Kg/L</span>
                  <span className="tank-label-volume">{currentVolume.toLocaleString()} / {maxCapacity.toLocaleString()}</span>
                  <span className="tank-level-status">{levelLabel} • {Math.round(fillPercentage)}%</span>
                </div>
              </div>
             </div>
           </div>

          <svg
            className="curved-arrow outgoing"
            viewBox="0 0 240 140"
            width="240"
            height="140"
          >
            <path
              d="M 160 70 Q 100 20, 10 70"
              fill="none"
              stroke="#2563eb"
              strokeWidth="4"
              strokeLinecap="round"
              markerEnd="url(#arrowheadRight)"
            />
            <defs>
              <marker
                id="arrowheadRight"
                markerWidth="10"
                markerHeight="7"
                refX="1"
                refY="3.5"
                orient="auto"
              >
                <polygon points="10 0, 0 3.5, 10 7" fill="#2563eb" />
              </marker>
            </defs>
          </svg>
        </div>

        <div className="info-panel right-panel">
          <div className="info-card">
            <h3>Quantity of Sold Milk</h3>
            <p className="info-value">{sold.toLocaleString()} L</p>
          </div>
          {/* <div className="info-card description-card">
            <p>
              When milk is sold, the volume of milk in the tank decreases.
            </p>
          </div> */}
        </div>
      </div>
    </div>
  )
}
