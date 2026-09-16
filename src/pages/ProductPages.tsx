/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { ShoppingCart, CheckCircle, FileText, CreditCard } from 'lucide-react'

type Unit = 'L' | 'Kg'

export const ProductRegistrationPage = () => {
  const [formData, setFormData] = useState({
    product_name: '',
    current_price: '',
    unit: 'L' as Unit
  })
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    api.products.getAll().then(setProducts).catch(() => setProducts([]))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const product = await api.products.create({ ...formData, created_by: 1 })
    setProducts([...products, product])
    setFormData({ product_name: '', current_price: '', unit: 'L' })
  }

  return (
    <div className="page">
      <h2>Product Registration</h2>
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label>Product Name</label>
          <input type="text" value={formData.product_name} onChange={(e) => setFormData({ ...formData, product_name: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Price (UGX)</label>
          <input type="number" value={formData.current_price} onChange={(e) => setFormData({ ...formData, current_price: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Unit</label>
          <select value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value as Unit })}>
            <option value="L">Liter (L)</option>
            <option value="Kg">Kilogram (Kg)</option>
          </select>
        </div>
        <button type="submit">Add Product</button>
      </form>

      <h3>Registered Products</h3>
      <table className="data-table">
        <thead>
          <tr><th>Name</th><th>Price (UGX)</th><th>Unit</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.product_id}>
              <td>{p.product_name}</td><td>{p.current_price?.toLocaleString()}</td><td>{p.unit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export const PriceManagementPage = () => {
  const [products, setProducts] = useState<any[]>([])
  const [selectedProductId, setSelectedProductId] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    api.products.getAll().then(setProducts).catch(() => setProducts([]))
  }, [])

  const selectedProduct = products.find(product => product.product_id.toString() === selectedProductId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const price = Number(newPrice)
    if (!selectedProductId) {
      setError('Please select a product')
      return
    }
    if (!price || price <= 0) {
      setError('Please enter a valid price greater than zero')
      return
    }

    try {
      const updatedProduct = await api.products.updatePrice(Number(selectedProductId), price)
      setProducts(products.map(product => product.product_id === updatedProduct.product_id ? updatedProduct : product))
      setSuccess(`${updatedProduct.product_name} price updated to RWF ${updatedProduct.current_price.toLocaleString()}`)
      setNewPrice('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product price')
    }
  }

  return (
    <div className="new-delivery-page">
      <div className="new-delivery-header">
        <div className="new-delivery-header-icon">
          <ShoppingCart size={32} />
        </div>
        <div>
          <h1>Product Price Management</h1>
          <p>Update product prices according to current market conditions</p>
        </div>
      </div>

      {error && <div className="new-delivery-alert error"><CheckCircle size={18} /> {error}</div>}
      {success && <div className="new-delivery-alert success"><CheckCircle size={18} /> {success}</div>}

      <form onSubmit={handleSubmit} className="new-delivery-form">
        <div className="new-delivery-section">
          <h3><ShoppingCart size={18} /> Update Product Price</h3>
          <div className="new-delivery-grid">
            <div className="form-group">
              <label><FileText size={16} /> Product</label>
              <select value={selectedProductId} onChange={(e) => {
                setSelectedProductId(e.target.value)
                const product = products.find(item => item.product_id.toString() === e.target.value)
                setNewPrice(product ? String(product.current_price) : '')
              }}>
                <option value="">Select a product</option>
                {products.map((product) => (
                  <option key={product.product_id} value={product.product_id}>
                    {product.product_name} - Current RWF {product.current_price?.toLocaleString()}/{product.unit}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label><CreditCard size={16} /> New Price (RWF/{selectedProduct?.unit || 'unit'})</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="Enter new price"
                required
              />
            </div>
          </div>
        </div>

        <div className="new-delivery-summary">
          <h4>Price Preview</h4>
          <div className="summary-row">
            <span>Product:</span>
            <span>{selectedProduct?.product_name || '—'}</span>
          </div>
          <div className="summary-row">
            <span>Current Price:</span>
            <span>{selectedProduct ? `RWF ${selectedProduct.current_price?.toLocaleString()}/${selectedProduct.unit}` : 'RWF 0'}</span>
          </div>
          <div className="summary-row">
            <span>New Price:</span>
            <span>{newPrice ? `RWF ${Number(newPrice).toLocaleString()}/${selectedProduct?.unit || 'unit'}` : 'RWF 0'}</span>
          </div>
        </div>

        <div className="new-delivery-actions">
          <button type="button" className="btn-secondary" onClick={() => {
            setSelectedProductId('')
            setNewPrice('')
            setError('')
            setSuccess('')
          }}>
            Clear
          </button>
          <button type="submit" className="btn-primary">Update Price</button>
        </div>
      </form>

      <div className="new-delivery-section">
        <h3><ShoppingCart size={18} /> Registered Products</h3>
        <div className="operator-table-host">
          <table className="operator-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Current Price (RWF)</th>
                <th>Unit</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.product_id}>
                  <td>{product.product_name}</td>
                  <td>{product.current_price?.toLocaleString()}</td>
                  <td>{product.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export const FarmerManagementPage = () => {
  const farmers = [
    { farmer_id: 1, full_name: 'John Dairy', farmer_code: 'FARM001', location: 'Kampala' },
    { farmer_id: 2, full_name: 'Peter Farms', farmer_code: 'FARM002', location: 'Jinja' },
    { farmer_id: 3, full_name: 'Mary Cows', farmer_code: 'FARM003', location: 'Mbale' }
  ]

  return (
    <div className="page">
      <h2>Farmer Management</h2>
      <table className="data-table">
        <thead>
          <tr><th>Name</th><th>Farmer Code</th><th>Location</th><th>Action</th>
          </tr>
        </thead>
        <tbody>
          {farmers.map((f) => (
            <tr key={f.farmer_id}>
              <td>{f.full_name}</td><td>{f.farmer_code}</td><td>{f.location}</td><td><button>Edit</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export const OperatorManagementPage = () => {
  const operators = [
    { operator_id: 1, full_name: 'Jane Operator', operator_code: 'OP001' },
    { operator_id: 2, full_name: 'Mike Staff', operator_code: 'OP002' }
  ]

  return (
    <div className="page">
      <h2>Operator Management</h2>
      <table className="data-table">
        <thead>
          <tr><th>Name</th><th>Operator Code</th><th>Action</th>
          </tr>
        </thead>
        <tbody>
          {operators.map((o) => (
            <tr key={o.operator_id}>
              <td>{o.full_name}</td><td>{o.operator_code}</td><td><button>Edit</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export const SystemSettingsPage = () => {
  return (
    <div className="page">
      <h2>System Settings</h2>
      <div className="settings-form">
        <div className="form-group">
          <label>System Name</label>
          <input type="text" defaultValue="MUDU MCC System" />
        </div>
        <div className="form-group">
          <label>Default Unit Price (UGX/L)</label>
          <input type="number" defaultValue="1500" />
        </div>
        <div className="form-group">
          <label>Notification Email</label>
          <input type="email" defaultValue="admin@mcc.com" />
        </div>
        <button>Save Settings</button>
      </div>
    </div>
  )
}