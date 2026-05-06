import React, { useState, useMemo } from 'react';
import ProductGrid from '../components/ProductGrid';
import { newArrivals, bestSellers, trendingNow } from '../utils/dummyData';
import { Filter, ChevronDown } from 'lucide-react';

const Shop = () => {
  const allProducts = useMemo(() => [...newArrivals, ...bestSellers, ...trendingNow], []);
  
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState(500);
  const [sortBy, setSortBy] = useState('featured');

  const categories = ['Outerwear', 'Dresses', 'Accessories', 'Tops', 'Bottoms'];

  const filteredProducts = useMemo(() => {
    let result = allProducts.filter(product => {
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
      const matchesPrice = product.price <= priceRange;
      return matchesCategory && matchesPrice;
    });

    if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);
    if (sortBy === 'rating') result.sort((a, b) => b.rating - a.rating);

    return result;
  }, [allProducts, selectedCategories, priceRange, sortBy]);

  const toggleCategory = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };

  return (
    <div className="shop-page">
      <div className="shop-header">
        <h1>All Collections</h1>
        <p>Browse our curated selection of premium apparel</p>
      </div>

      <div className="shop-container">
        {/* Sidebar Filters */}
        <aside className="shop-sidebar">
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
            <h3>Max Price: ${priceRange}</h3>
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
        </aside>

        {/* Main Content */}
        <main className="shop-main">
          <div className="shop-toolbar">
            <p className="results-count">{filteredProducts.length} Products Found</p>
            <div className="sort-dropdown">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            <ProductGrid products={filteredProducts} />
          ) : (
            <div className="no-results">
              <h3>No products match your filters</h3>
              <button className="btn-secondary" onClick={() => {
                setSelectedCategories([]);
                setPriceRange(500);
              }}>Clear All Filters</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Shop;
