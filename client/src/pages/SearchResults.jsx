import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid';
import ProductFilters from '../components/ProductFilters';
import { productService } from '../services/productService';
import Loader from '../components/Loader/Loader';

const SearchResults = () => {
  const location = useLocation();
  const searchQuery = new URLSearchParams(location.search).get('q') || '';
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState(500);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);

  const categories = ['Outerwear', 'Dresses', 'Accessories', 'Knitwear', 'Bottoms', 'Shirts', 'Tops', 'Essentials'];
  const allColors = ['Black', 'White', 'Beige', 'Navy', 'Olive', 'Brown'];
  const allSizes = ['XS', 'S', 'M', 'L', 'XL'];

  // Fetch from server with search term + filters
  const fetchResults = useCallback(async () => {
    if (!searchQuery) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await productService.getFilteredProducts({
        search: searchQuery,
        categories: selectedCategories,
        colors: selectedColors,
        sizes: selectedSizes,
        maxPrice: priceRange,
      });
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products for search results:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategories, selectedColors, selectedSizes, priceRange]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const toggleCategory = (category) => {
    setSelectedCategories(prev => prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]);
  };
  const toggleColor = (color) => {
    setSelectedColors(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]);
  };
  const toggleSize = (size) => {
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };
  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange(500);
    setSelectedColors([]);
    setSelectedSizes([]);
  };

  if (loading) return <Loader />;

  return (
    <div className="search-results-page">
      <div className="search-header">
        <h1>Search Results</h1>
        <p>Showing {products.length} results for "<b>{searchQuery}</b>"</p>
      </div>

      <div className="shop-container search-container-results">
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
        
        <main className="shop-main">
          {products.length > 0 ? (
            <ProductGrid title="Matching Items" products={products} />
          ) : (
            <div className="no-search-page-results">
              <h2>No products match your criteria</h2>
              <p>Try adjusting your search or filters.</p>
              <button className="btn-secondary" onClick={clearFilters} style={{ marginTop: '1rem' }}>Clear Filters</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SearchResults;
