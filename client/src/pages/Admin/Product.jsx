import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';
import { adminService } from '../../services/adminService';
import Loader from '../../components/Loader/Loader';

const Product = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [modalError, setModalError] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: '',
    sizes: [],
    colors: []
  });

  const [colorInput, setColorInput] = useState('');

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllProducts();
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err);
      setError('Failed to load products catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      imageUrl: '',
      sizes: [],
      colors: []
    });
    setColorInput('');
    setModalError('');
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      category: product.category,
      imageUrl: product.image,
      sizes: product.sizes || [],
      colors: product.colors || []
    });
    setColorInput((product.colors || []).join(', '));
    setModalError('');
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSizeToggle = (size) => {
    setFormData(prev => {
      const sizes = prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size];
      return { ...prev, sizes };
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    // Process colors from comma separated input
    const colors = colorInput
      .split(',')
      .map(c => c.trim())
      .filter(c => c.length > 0);

    const productData = {
      ...formData,
      price: Number(formData.price),
      colors
    };

    if (!productData.name || !productData.price || !productData.category || !productData.imageUrl) {
      setModalError('Please fill in Name, Price, Category, and Image URL.');
      return;
    }

    try {
      if (editingProduct) {
        await adminService.updateProduct(editingProduct.id, productData);
      } else {
        await adminService.addProduct(productData);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      console.error('Failed to save product:', err);
      setModalError(err.message || 'Error occurred while saving product.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await adminService.deleteProduct(id);
        fetchProducts();
      } catch (err) {
        console.error('Failed to delete product:', err);
        alert(err.message || 'Cannot delete product. It may have orders referencing it.');
      }
    }
  };

  if (loading && products.length === 0) return <Loader />;

  return (
    <div className="admin-products-page">
      <div className="admin-page-header">
        <div>
          <h1>Products Catalogue</h1>
          <p className="admin-page-subtitle">Add, edit, or delete items in your inventory</p>
        </div>
        <button className="btn-primary" onClick={openAddModal}>
          <Plus size={18} /> Add New Product
        </button>
      </div>

      {error && (
        <div className="admin-error-banner">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="admin-card">
        <div className="admin-table-wrapper">
          {products.length === 0 ? (
            <p className="no-data-text">No products in catalogue yet.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Image</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Sizes</th>
                  <th>Colors</th>
                  <th style={{ width: '120px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="admin-table-img">
                        <img src={product.image} alt={product.name} />
                      </div>
                    </td>
                    <td>
                      <div className="product-table-name">
                        <b>{product.name}</b>
                        <p className="product-desc-trunc">{product.description || 'No description provided.'}</p>
                      </div>
                    </td>
                    <td><span className="category-tag">{product.category}</span></td>
                    <td><b>${Number(product.price).toFixed(2)}</b></td>
                    <td>
                      <div className="table-chips">
                        {(product.sizes || []).map(s => (
                          <span key={s} className="table-chip size-chip">{s}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="table-chips">
                        {(product.colors || []).map(c => (
                          <span key={c} className="table-chip color-chip" style={{ borderLeft: `4px solid ${c.toLowerCase() === 'white' ? '#ccc' : c.toLowerCase()}` }}>{c}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="action-btn edit-btn" onClick={() => openEditModal(product)} title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button className="action-btn delete-btn" onClick={() => handleDelete(product.id)} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Dialog overlay */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-container">
            <div className="modal-header">
              <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit}>
              <div className="modal-body">
                {modalError && <div className="modal-error-banner">{modalError}</div>}
                
                <div className="form-group">
                  <label>Product Name <span className="text-danger">*</span></label>
                  <input 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    placeholder="e.g. Classic Trench Coat" 
                    required 
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Category <span className="text-danger">*</span></label>
                    <input 
                      name="category" 
                      value={formData.category} 
                      onChange={handleInputChange} 
                      placeholder="e.g. Outerwear" 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Price ($ USD) <span className="text-danger">*</span></label>
                    <input 
                      name="price" 
                      type="number" 
                      step="0.01" 
                      min="0.01" 
                      value={formData.price} 
                      onChange={handleInputChange} 
                      placeholder="e.g. 149.99" 
                      required 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Image URL <span className="text-danger">*</span></label>
                  <input 
                    name="imageUrl" 
                    value={formData.imageUrl} 
                    onChange={handleInputChange} 
                    placeholder="https://images.unsplash.com/..." 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea 
                    name="description" 
                    rows="3" 
                    value={formData.description} 
                    onChange={handleInputChange} 
                    placeholder="Provide details about materials, fitting, and style..."
                  />
                </div>

                <div className="form-group">
                  <label>Available Sizes</label>
                  <div className="size-checkboxes">
                    {availableSizes.map(size => (
                      <label key={size} className="checkbox-label">
                        <input 
                          type="checkbox" 
                          checked={formData.sizes.includes(size)} 
                          onChange={() => handleSizeToggle(size)} 
                        />
                        <span className="checkbox-custom-btn">{size}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Available Colors (comma separated)</label>
                  <input 
                    value={colorInput} 
                    onChange={(e) => setColorInput(e.target.value)} 
                    placeholder="e.g. Black, Navy, Off-White" 
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Product;
