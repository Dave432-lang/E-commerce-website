import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, X, AlertCircle, Archive, RotateCcw, Upload, Image as ImageIcon } from 'lucide-react';
import { adminService } from '../../services/adminService';
import Loader from '../../components/Loader/Loader';

const Product = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleImageFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setModalError('Please select a valid image file (JPG, PNG, WEBP, etc.).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDimension = 900;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setFormData(prev => ({ ...prev, imageUrl: dataUrl }));
        setModalError('');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };
  
  // Sample luxury fashion image presets for easy populating
  const sampleImages = [
    { label: 'Jacket/Coat', url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80' },
    { label: 'Dress', url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80' },
    { label: 'Handbag', url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80' },
    { label: 'Shoes', url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80' }
  ];
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    salePrice: '',
    gender: 'unisex',
    category: '',
    imageUrl: '',
    stockQuantity: 50,
    isFeatured: false,
    isNewArrival: false,
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
      salePrice: '',
      gender: 'unisex',
      category: '',
      imageUrl: '',
      stockQuantity: 50,
      isFeatured: false,
      isNewArrival: false,
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
      salePrice: product.sale_price ?? '',
      gender: product.gender || 'unisex',
      category: product.category,
      imageUrl: product.image,
      stockQuantity: product.stock_quantity ?? 50,
      isFeatured: Boolean(product.is_featured),
      isNewArrival: Boolean(product.is_new_arrival),
      sizes: product.sizes || [],
      colors: product.colors || []
    });
    setColorInput((product.colors || []).join(', '));
    setModalError('');
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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

    if (!formData.name || !formData.name.trim()) {
      setModalError('Please enter a valid Product Name.');
      return;
    }

    const priceNum = Number(formData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setModalError('Please enter a valid Regular Price greater than GH₵0.');
      return;
    }

    if (!formData.category || !formData.category.trim()) {
      setModalError('Please enter a Product Category.');
      return;
    }

    if (!formData.imageUrl || !formData.imageUrl.trim()) {
      setModalError('Please enter or select an Image URL.');
      return;
    }

    // Process colors from comma separated input
    const colors = colorInput
      .split(',')
      .map(c => c.trim())
      .filter(c => c.length > 0);

    const productData = {
      ...formData,
      name: formData.name.trim(),
      category: formData.category.trim(),
      imageUrl: formData.imageUrl.trim(),
      price: priceNum,
      salePrice: formData.salePrice !== '' && formData.salePrice !== null ? Number(formData.salePrice) : null,
      stockQuantity: Math.max(0, Number(formData.stockQuantity) || 0),
      colors
    };

    setSubmitting(true);
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
      setModalError(err.message || 'Error occurred while saving product. Please check your credentials or backend server status.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleArchive = async (id) => {
    try {
      await adminService.toggleArchiveProduct(id);
      fetchProducts();
    } catch (err) {
      console.error('Failed to toggle product archive status:', err);
      alert(err.message || 'Error toggling product status.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product? (If it has order history, it will be safely soft-archived instead).')) {
      try {
        const res = await adminService.deleteProduct(id);
        if (res.message) {
          alert(res.message);
        }
        fetchProducts();
      } catch (err) {
        console.error('Failed to delete product:', err);
        alert(err.message || 'Error processing deletion.');
      }
    }
  };

  if (loading && products.length === 0) return <Loader />;

  return (
    <div className="admin-products-page">
      <div className="admin-page-header">
        <div>
          <h1>Products Catalogue</h1>
          <p className="admin-page-subtitle">Add, edit, archive, or manage stock in your inventory</p>
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
                  <th style={{ width: '70px' }}>Image</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Sizes</th>
                  <th style={{ width: '130px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const stock = product.stock_quantity ?? 50;
                  const isArchived = Boolean(product.is_archived);
                  return (
                    <tr key={product.id} style={isArchived ? { opacity: 0.6, background: '#fafafa' } : {}}>
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
                      <td><b>GH₵{Number(product.price).toFixed(2)}</b></td>
                      <td>
                        <span style={{ 
                          fontWeight: 600, 
                          color: stock === 0 ? '#dc2626' : stock < 10 ? '#d97706' : '#16a34a' 
                        }}>
                          {stock}
                        </span>
                      </td>
                      <td>
                        <span style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: 600, 
                          padding: '0.2rem 0.5rem', 
                          borderRadius: '12px', 
                          backgroundColor: isArchived ? '#f3f4f6' : '#dcfce7',
                          color: isArchived ? '#6b7280' : '#16a34a'
                        }}>
                          {isArchived ? 'Archived' : 'Active'}
                        </span>
                      </td>
                      <td>
                        <div className="table-chips">
                          {(product.sizes || []).map(s => (
                            <span key={s} className="table-chip size-chip">{s}</span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button className="action-btn edit-btn" onClick={() => openEditModal(product)} title="Edit">
                            <Edit2 size={16} />
                          </button>
                          <button 
                            className="action-btn" 
                            onClick={() => handleToggleArchive(product.id)} 
                            title={isArchived ? "Restore product to shop" : "Archive product"}
                            style={{ color: isArchived ? '#16a34a' : '#d97706' }}
                          >
                            {isArchived ? <RotateCcw size={16} /> : <Archive size={16} />}
                          </button>
                          <button className="action-btn delete-btn" onClick={() => handleDelete(product.id)} title="Delete / Soft Archive">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
                    <label>Department / Gender <span className="text-danger">*</span></label>
                    <select 
                      name="gender" 
                      value={formData.gender} 
                      onChange={handleInputChange} 
                      required
                    >
                      <option value="women">Women</option>
                      <option value="men">Men</option>
                      <option value="unisex">Unisex</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Category <span className="text-danger">*</span></label>
                    <input 
                      name="category" 
                      value={formData.category} 
                      onChange={handleInputChange} 
                      placeholder="e.g. Dresses, Shirts, Shoes" 
                      required 
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Regular Price (GH₵) <span className="text-danger">*</span></label>
                    <input 
                      name="price" 
                      type="number" 
                      step="0.01" 
                      min="0.01" 
                      value={formData.price} 
                      onChange={handleInputChange} 
                      placeholder="e.g. 299.99" 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Sale Price (GH₵, optional)</label>
                    <input 
                      name="salePrice" 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      value={formData.salePrice} 
                      onChange={handleInputChange} 
                      placeholder="e.g. 249.99" 
                    />
                  </div>
                  <div className="form-group">
                    <label>Stock Quantity <span className="text-danger">*</span></label>
                    <input 
                      name="stockQuantity" 
                      type="number" 
                      min="0" 
                      value={formData.stockQuantity} 
                      onChange={handleInputChange} 
                      placeholder="e.g. 50" 
                      required 
                    />
                  </div>
                </div>

                <div className="form-row" style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
                  <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      name="isFeatured" 
                      checked={formData.isFeatured} 
                      onChange={handleInputChange} 
                    />
                    <span>Featured Product (Showcase on Home)</span>
                  </label>

                  <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginLeft: '1.5rem' }}>
                    <input 
                      type="checkbox" 
                      name="isNewArrival" 
                      checked={formData.isNewArrival} 
                      onChange={handleInputChange} 
                    />
                    <span>New Arrival Tag</span>
                  </label>
                </div>

                <div className="form-group">
                  <label>Product Image <span className="text-danger">*</span></label>
                  
                  {/* Hidden File Input */}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    accept="image/*" 
                    onChange={handleImageFileUpload} 
                    style={{ display: 'none' }} 
                  />

                  {/* Direct File Upload Button */}
                  <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => fileInputRef.current && fileInputRef.current.click()}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', background: 'rgba(255, 255, 255, 0.06)' }}
                    >
                      <Upload size={18} />
                      Choose Image File from Computer
                    </button>
                  </div>

                  {/* External URL Input Fallback */}
                  <div style={{ position: 'relative' }}>
                    <input 
                      name="imageUrl" 
                      value={formData.imageUrl} 
                      onChange={handleInputChange} 
                      placeholder="Or paste an Image URL (https://...)" 
                      required 
                    />
                  </div>

                  {/* Preset Sample Images */}
                  <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Presets:</span>
                    {sampleImages.map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="btn-secondary btn-small"
                        onClick={() => setFormData(prev => ({ ...prev, imageUrl: sample.url }))}
                        style={{ padding: '2px 8px', fontSize: '0.75rem', borderRadius: '4px' }}
                      >
                        + {sample.label}
                      </button>
                    ))}
                  </div>

                  {/* Live Image Preview Box */}
                  {formData.imageUrl && (
                    <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255, 255, 255, 0.04)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img 
                          src={formData.imageUrl} 
                          alt="Product Preview" 
                          style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>
                            {formData.imageUrl.startsWith('data:image/') ? 'Uploaded Image Selected' : 'Image URL Selected'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ready to save into catalogue</div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                        style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#f87171', border: '1px solid rgba(248, 113, 113, 0.3)' }}
                      >
                        Remove Image
                      </button>
                    </div>
                  )}
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
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Saving Product...' : editingProduct ? 'Save Changes' : 'Create Product'}
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
