import React from 'react';
import { Filter, ChevronDown, X } from 'lucide-react';

const ProductFilters = ({
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
  clearFilters
}) => {
  return (
    <aside className="shop-sidebar product-filters">
      <div className="filter-header-mobile">
        <Filter size={20} />
        <h2>Filters</h2>
        {clearFilters && (
          <button className="clear-filters-btn" onClick={clearFilters}>
            Clear
          </button>
        )}
      </div>

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

      <div className="filter-group">
        <h3>Price Range</h3>
        <p className="price-label">Up to ${priceRange}</p>
        <input 
          type="range" 
          min="0" 
          max="500" 
          step="10"
          value={priceRange}
          onChange={(e) => setPriceRange(parseInt(e.target.value))}
          className="price-slider"
        />
      </div>

      <div className="filter-group">
        <h3>Color</h3>
        <div className="color-options">
          {allColors.map(color => (
            <button
              key={color}
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

      <div className="filter-group">
        <h3>Size</h3>
        <div className="size-options">
          {allSizes.map(size => (
            <button
              key={size}
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
