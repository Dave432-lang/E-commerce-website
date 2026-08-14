import React from 'react';
import { Filter, ChevronDown, X } from 'lucide-react';

const ProductFilters = ({
  department,
  setDepartment,
  categories,
  selectedCategories,
  toggleCategory,
  priceRange,
  setPriceRange,
  allColors,
  selectedColors,
  toggleColor,
  allSizes,
  selectedSizes,
  toggleSize,
  inStockOnly,
  setInStockOnly,
  onSale,
  setOnSale,
  isNewArrival,
  setIsNewArrival,
  clearFilters
}) => {
  return (
    <aside className="shop-sidebar product-filters">
      <div className="filter-header-mobile">
        <Filter size={20} />
        <h2>Filters</h2>
        {clearFilters && (
          <button className="clear-filters-btn" onClick={clearFilters}>
            Clear All
          </button>
        )}
      </div>

      {/* Department Filter */}
      <div className="filter-group">
        <h3>Department</h3>
        <div className="department-options">
          {['all', 'women', 'men', 'unisex'].map(dept => (
            <button
              key={dept}
              type="button"
              className={`dept-btn ${department === dept ? 'active' : ''}`}
              onClick={() => setDepartment(dept)}
            >
              {dept.charAt(0).toUpperCase() + dept.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Categories */}
      <div className="filter-group">
        <h3>Categories</h3>
        <div className="filter-options">
          {categories.map(category => (
            <label key={category} className="filter-checkbox">
              <input 
                type="checkbox" 
                checked={selectedCategories.includes(category)}
                onChange={() => toggleCategory(category)}
              />
              <span>{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Availability & Deals */}
      <div className="filter-group">
        <h3>Filter By</h3>
        <label className="filter-checkbox" style={{ marginBottom: '0.5rem' }}>
          <input 
            type="checkbox" 
            checked={inStockOnly} 
            onChange={(e) => setInStockOnly(e.target.checked)} 
          />
          <span>In Stock Only</span>
        </label>
        <label className="filter-checkbox" style={{ marginBottom: '0.5rem' }}>
          <input 
            type="checkbox" 
            checked={onSale} 
            onChange={(e) => setOnSale(e.target.checked)} 
          />
          <span>On Sale Only</span>
        </label>
        <label className="filter-checkbox">
          <input 
            type="checkbox" 
            checked={isNewArrival} 
            onChange={(e) => setIsNewArrival(e.target.checked)} 
          />
          <span>New Arrivals</span>
        </label>
      </div>

      {/* Price Range */}
      <div className="filter-group">
        <h3>Price Range</h3>
        <p className="price-label">Up to GH₵{priceRange}</p>
        <input 
          type="range" 
          min="50" 
          max="2000" 
          step="50"
          value={priceRange}
          onChange={(e) => setPriceRange(parseInt(e.target.value))}
          className="price-slider"
        />
      </div>

      {/* Color */}
      <div className="filter-group">
        <h3>Color</h3>
        <div className="color-options">
          {allColors.map(color => (
            <button
              key={color}
              type="button"
              className={`color-swatch-btn ${selectedColors.includes(color) ? 'selected' : ''}`}
              title={color}
              onClick={() => toggleColor(color)}
              style={{ backgroundColor: color.toLowerCase() === 'white' ? '#f5f5f5' : color.toLowerCase() }}
            >
              {selectedColors.includes(color) && color.toLowerCase() !== 'white' && color.toLowerCase() !== 'beige' && <X size={12} color="white" />}
              {selectedColors.includes(color) && (color.toLowerCase() === 'white' || color.toLowerCase() === 'beige') && <X size={12} color="black" />}
            </button>
          ))}
        </div>
      </div>

      {/* Size */}
      <div className="filter-group">
        <h3>Size</h3>
        <div className="size-options">
          {allSizes.map(size => (
            <button
              key={size}
              type="button"
              className={`size-chip-btn ${selectedSizes.includes(size) ? 'selected' : ''}`}
              onClick={() => toggleSize(size)}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default ProductFilters;
