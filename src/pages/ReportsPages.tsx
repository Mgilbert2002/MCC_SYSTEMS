/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { ShoppingCart, TrendingUp, Package, CreditCard, Calendar } from 'lucide-react'

export const DeliveryReportsPage = () => {
  const [deliveries, setDeliveries] = useState([])

  useEffect(() => {
    api.deliveries.getAll().then(setDeliveries).catch(() => setDeliveries([]))
  }, [])

  return (
    <div className="page">
      <h2>Delivery Reports</h2>
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th><th>Farmer</th><th>Quantity (kg)</th><th>Date</th><th>Status</th><th>Payment</th>
          </tr>
        </thead>
        <tbody>
          {deliveries.map((d: any) => (
            <tr key={d.delivery_id}>
              <td>{d.delivery_id}</td>
<td>{d.farmer?.user?.full_name || d.farmer?.full_name || 'N/A'}</td>
<td>{d.quantity_kg}</td>
<td>{d.delivery_date}</td>
              <td><span className={`status ${d.status}`}>{d.status}</span></td><td><span className={`status ${d.payment_status}`}>{d.payment_status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export const SaleReportsPage = () => {
  const [sales, setSales] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  const refreshSales = () => {
    api.sales.getAll().then(setSales).catch(() => setSales([]))
  }

  useEffect(() => {
    refreshSales()
  }, [])

  useEffect(() => {
    const handlePaymentStatusChanged = () => refreshSales()
    window.addEventListener('payment-status-changed', handlePaymentStatusChanged)
    return () => window.removeEventListener('payment-status-changed', handlePaymentStatusChanged)
  }, [])

  const filteredSales = sales.filter((sale) => {
    const searchText = searchTerm.toLowerCase()
    const productName = sale.product?.product_name?.toLowerCase() || ''
    const clientName = sale.client_name?.toLowerCase() || ''
    const saleId = String(sale.sale_id || '')
    return productName.includes(searchText) || clientName.includes(searchText) || saleId.includes(searchText)
  })

  const totalSales = filteredSales.reduce((sum, sale) => sum + Number(sale.total_cost || 0), 0)
  const totalQuantity = filteredSales.reduce((sum, sale) => sum + Number(sale.quantity || 0), 0)
  const paidSales = filteredSales.filter(sale => sale.payment_status === 'paid').length
  const latestSale = filteredSales.length > 0 ? filteredSales[0] : null

  const formatDate = (date: string) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const formatCurrency = (value: number) => `RWF ${Number(value || 0).toLocaleString()}`

  return (
    <div className="report-page">
      <div className="report-header">
        <div>
          <h2>Sales Report</h2>
          <p>Track product sales, payment status, and revenue</p>
        </div>
        <div className="report-header-icon">
          <ShoppingCart size={32} />
        </div>
      </div>

      <div className="report-summary-grid">
        <div className="report-summary-card">
          <TrendingUp size={22} />
          <span>Total Revenue</span>
          <strong>{formatCurrency(totalSales)}</strong>
        </div>
        <div className="report-summary-card">
          <Package size={22} />
          <span>Total Quantity</span>
          <strong>{totalQuantity.toLocaleString()}</strong>
        </div>
        <div className="report-summary-card">
          <CreditCard size={22} />
          <span>Paid Sales</span>
          <strong>{paidSales}</strong>
        </div>
        <div className="report-summary-card">
          <Calendar size={22} />
          <span>Records</span>
          <strong>{filteredSales.length}</strong>
        </div>
      </div>

      <div className="report-actions">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by product, client, or sale ID..."
        />
        {latestSale && (
          <div className="report-latest">
            Latest sale: <strong>{latestSale.product?.product_name || 'N/A'}</strong> on {formatDate(latestSale.sale_date)}
          </div>
        )}
      </div>

      <div className="report-table-wrapper">
        <table className="report-table">
          <thead>
            <tr>
              <th>Sale ID</th>
              <th>Product</th>
              <th>Client</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
              <th>Date</th>
              <th>Payment</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.length > 0 ? filteredSales.map((sale) => (
              <tr key={sale.sale_id}>
                <td>#{sale.sale_id}</td>
                <td>
                  <div className="report-product-cell">
                    <span>{sale.product?.product_name || 'N/A'}</span>
                    <small>{sale.product?.unit || 'unit'}</small>
                  </div>
                </td>
                <td>{sale.client_name || 'N/A'}</td>
                <td>{Number(sale.quantity || 0).toLocaleString()} {sale.product?.unit || ''}</td>
                <td>{formatCurrency(sale.unit_price)}</td>
                <td><strong>{formatCurrency(sale.total_cost)}</strong></td>
                <td>{formatDate(sale.sale_date)}</td>
                <td>
                  <span className={`report-badge ${sale.payment_status === 'paid' ? 'paid' : 'unpaid'}`}>
                    {sale.payment_status || 'unpaid'}
                  </span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={8} className="report-empty">No sales found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export const PaymentActivitiesPage = () => {
  const [payments, setPayments] = useState([])

  useEffect(() => {
    api.payments.getAll().then(setPayments).catch(() => setPayments([]))
  }, [])

  return (
    <div className="page">
      <h2>Payment Activities</h2>
      <table className="data-table">
        <thead>
          <tr><th>ID</th><th>Farmer</th><th>Amount (UGX)</th><th>Method</th><th>Date</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p: any) => (
            <tr key={p.payment_id}>
              <td>{p.payment_id}</td><td>{p.farmer?.full_name || 'N/A'}</td><td>{p.amount_paid?.toLocaleString()}</td><td>{p.payment_method}</td><td>{p.payment_date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export const PaymentRecordsPage = () => {
  const [payments, setPayments] = useState([])

  useEffect(() => {
    api.payments.getAll().then(setPayments).catch(() => setPayments([]))
  }, [])

  return (
    <div className="page">
      <h2>My Payment Records</h2>
      <table className="data-table">
        <thead>
          <tr><th>Delivery ID</th><th>Date</th><th>Amount (UGX)</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p: any) => (
            <tr key={p.payment_id}>
              <td>{p.delivery_id}</td><td>{p.payment_date}</td><td>{p.amount_paid?.toLocaleString()}</td><td><span className={`status ${p.unpaid_balance > 0 ? 'unpaid' : 'paid'}`}>{p.unpaid_balance > 0 ? 'unpaid' : 'paid'}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}