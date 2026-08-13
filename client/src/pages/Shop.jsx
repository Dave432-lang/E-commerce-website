import React, { useState, useEffect, useCallback } from 'react';
import ProductGrid from '../components/ProductGrid';
import ProductFilters from '../components/ProductFilters';
import Loader from '../components/Loader/Loader';
import { productService } from '../services/productService';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState(500);
  const [sortBy, setSortBy] = useState('featured');
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);

  const categories = ['Outerwear', 'Dresses', 'Knitwear', 'Bottoms', 'Shirts', 'Accessories', 'Tops', 'Essentials'];
  const allColors = ['Black', 'White', 'Beige', 'Navy', 'Olive', 'Brown'];
  const allSizes = ['XS', 'S', 'M', 'L', 'XL'];

  // Fetch from server whenever any filter changes
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productService.getFilteredProducts({
        categories: selectedCategories,
        colors: selectedColors,
        sizes: selectedSizes,
        maxPrice: priceRange,
        sortBy
      });
      setProducts(data);
    } catch (error) {
      console.error('Failed to load shop products:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategories, selectedColors, selectedSizes, priceRange, sortBy]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const toggleCategory = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };

  const toggleColor = (color) => {
    setSelectedColors(prev => 
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const toggleSize = (size) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange(500);
    setSelectedColors([]);
    setSelectedSizes([]);
    setSortBy('featured');
  };

  return (
    <div className="shop-page">
      <div className="shop-header">
        <h1>All Collections</h1>
        <p>Browse our curated selection of premium apparel</p>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="shop-container">
          {/* Sidebar Filters */}
          <ProductFilters
            categories={categories}
            selectedCategories={selectedCategories}
            toggleCategory={toggleCategory}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            allColors={allColors}
            selectedColors={selectedColors}
            toggleColor={toggleColor}
            allSizes={allSizes}
            selectedSizes={selectedSizes}
            toggleSize={toggleSize}
            clearFilters={clearFilters}
          />

          {/* Main Content */}
          <main className="shop-main">
            <div className="shop-toolbar">
              <p className="results-count">{products.length} Products Found</p>
              <div className="sort-dropdown">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>

            {products.length > 0 ? (
              <ProductGrid products={products} />
            ) : (
              <div className="no-results">
                <h3>No products match your filters</h3>
                <button className="btn-secondary" onClick={clearFilters}>Clear All Filters</button>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
};

export default Shop;
