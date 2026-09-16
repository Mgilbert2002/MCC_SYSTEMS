import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import { ShoppingCart, User, Package, Weight, Calendar, CreditCard, FileText, CheckCircle } from 'lucide-react'

type Unit = 'L' | 'Kg'
type PaymentStatus = 'paid' | 'unpaid'

type Product = {
  product_id: number
  product_name: string
  current_price: number
  unit: Unit
}

const initialForm = {
  product_id: '',
  client_name: '',
  quantity: '',
  unit_price: '',
  payment_status: 'unpaid' as PaymentStatus,
  sale_date: new Date().toISOString().split('T')[0]
}

export const NewSalePage = () => {
  const navigate = useNavigate()
  const { user, userData } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [formData, setFormData] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    api.products.getAll()
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))
      .finally(() => setLoadingProducts(false))
  }, [])

  const selectedProduct = products.find(product => product.product_id.toString() === formData.product_id)
  const quantity = Number(formData.quantity)
  const selectedUnitPrice = Number(formData.unit_price) || selectedProduct?.current_price || 0
  const totalCost = selectedProduct && quantity > 0 && selectedUnitPrice > 0 ? quantity * selectedUnitPrice : 0
  const getOperatorId = () => {
    if (userData && 'operator_id' in userData) return userData.operator_id
    return user?.user_id
  }

  const handleProductChange = (productId: string) => {
    const product = products.find(item => item.product_id.toString() === productId)
    setFormData({
      ...formData,
      product_id: productId,
      unit_price: product ? String(product.current_price) : ''
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!selectedProduct) {
      setError('Please select a product')
      return
    }

    if (!formData.client_name.trim()) {
      setError('Please enter client name')
      return
    }

    if (!quantity || quantity <= 0) {
      setError('Please enter a valid quantity')
      return
    }

    if (!selectedUnitPrice || selectedUnitPrice <= 0) {
      setError('Please enter a valid unit price')
      return
    }

    try {
      setSubmitting(true)

      const payload = {
        product_id: selectedProduct.product_id,
        operator_id: getOperatorId(),
        client_name: formData.client_name.trim(),
        quantity,
        unit_price: selectedUnitPrice,
        payment_status: formData.payment_status,
        sale_date: formData.sale_date
      }

      await api.sales.create(payload)
      const soldAmount = selectedProduct.unit === 'L' ? `${quantity.toLocaleString()} L` : 'no tank change'

      setSuccess(`Sale recorded successfully. ${selectedProduct.product_name} sold by ${quantity.toLocaleString()} ${selectedProduct.unit} at RWF ${selectedUnitPrice.toLocaleString()}/${selectedProduct.unit}. Tank decreased by ${soldAmount}.`)
      setFormData(initialForm)
      setTimeout(() => {
        setSuccess('')
        navigate('/operator/sales')
      }, 1800)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record sale')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="new-delivery-page">
      <div className="new-delivery-header">
        <div className="new-delivery-header-icon">
          <ShoppingCart size={32} />
        </div>
        <div>
          <h1>New Product Sale</h1>
          <p>Record a milk/product sale and update the milk tank automatically</p>
        </div>
      </div>

      {error && <div className="new-delivery-alert error"><CheckCircle size={18} /> {error}</div>}
      {success && <div className="new-delivery-alert success"><CheckCircle size={18} /> {success}</div>}

      <form onSubmit={handleSubmit} className="new-delivery-form">
        <div className="new-delivery-section">
          <h3><Package size={18} /> Product Details</h3>
          <div className="new-delivery-grid">
            <div className="form-group">
              <label><FileText size={16} /> Product</label>
              <select
                value={formData.product_id}
                onChange={(e) => handleProductChange(e.target.value)}
                required
                disabled={loadingProducts}
              >
                <option value="">{loadingProducts ? 'Loading products...' : 'Select a product'}</option>
                {products.map((product) => (
                  <option key={product.product_id} value={product.product_id}>
                    {product.product_name} - RWF {product.current_price.toLocaleString()}/{product.unit}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label><Calendar size={16} /> Sale Date</label>
              <input
                type="date"
                value={formData.sale_date}
                onChange={(e) => setFormData({ ...formData, sale_date: e.target.value })}
                required
              />
            </div>
          </div>
        </div>

        <div className="new-delivery-section">
          <h3><User size={18} /> Customer Details</h3>
          <div className="new-delivery-grid">
            <div className="form-group">
              <label><User size={16} /> Client Name</label>
              <input
                type="text"
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                placeholder="Client full name"
                required
              />
            </div>
            <div className="form-group">
              <label><Weight size={16} /> Quantity ({selectedProduct?.unit || 'L/Kg'})</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
          </div>
        </div>

        <div className="new-delivery-section">
          <h3><CreditCard size={18} /> Payment Details</h3>
          <div className="new-delivery-grid">
            <div className="form-group">
              <label><CreditCard size={16} /> Payment Status</label>
              <select
                value={formData.payment_status}
                onChange={(e) => setFormData({ ...formData, payment_status: e.target.value as PaymentStatus })}
              >
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            <div className="form-group">
              <label><FileText size={16} /> Unit Price</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={selectedUnitPrice || ''}
                onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                placeholder={`RWF per ${selectedProduct?.unit || 'unit'}`}
                required
              />
            </div>
          </div>
        </div>

        <div className="new-delivery-summary">
          <h4>Sale Summary</h4>
          <div className="summary-row">
            <span>Product:</span>
            <span>{selectedProduct?.product_name || '—'}</span>
          </div>
          <div className="summary-row">
            <span>Quantity:</span>
            <span>{quantity > 0 ? `${quantity.toLocaleString()} ${selectedProduct?.unit || ''}` : '0'}</span>
          </div>
          <div className="summary-row">
            <span>Unit Price:</span>
            <span>{selectedProduct ? `RWF ${selectedUnitPrice.toLocaleString()}/${selectedProduct.unit}` : 'RWF 0'}</span>
          </div>
          <div className="summary-row total">
            <span>Total Cost:</span>
            <span>RWF {totalCost.toLocaleString()}</span>
          </div>
        </div>

        <div className="new-delivery-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate('/operator')}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={submitting || loadingProducts}>
            {submitting ? 'Recording Sale...' : 'Record Sale'}
          </button>
        </div>
      </form>
    </div>
  )
}