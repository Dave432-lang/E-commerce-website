import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid';
import ProductFilters from '../components/ProductFilters';
import { productService } from '../services/productService';
import Loader from '../components/Loader/Loader';

const SearchResults = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q') || '';
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState(500);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);

  const categories = ['Outerwear', 'Dresses', 'Accessories', 'Knitwear', 'Bottoms'];
  const allColors = ['Black', 'White', 'Beige', 'Navy', 'Olive', 'Brown'];
  const allSizes = ['XS', 'S', 'M', 'L', 'XL'];

  useEffect(() => {
    const fetchSearchProducts = async () => {
      try {
        const data = await productService.getAllProducts();
        setProducts(data);
      } catch (error) {
        console.error('Failed to load products for search results:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSearchProducts();
  }, []);

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

  const results = useMemo(() => {
    if (!query) return [];
    return products.filter(p => {
      const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase()) || p.category.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(p.category);
      const matchesPrice = Number(p.price) <= priceRange;
      const matchesColor = selectedColors.length === 0 || (p.colors && p.colors.some(c => selectedColors.includes(c)));
      const matchesSize = selectedSizes.length === 0 || (p.sizes && p.sizes.some(s => selectedSizes.includes(s)));
      return matchesQuery && matchesCategory && matchesPrice && matchesColor && matchesSize;
    });
  }, [products, query, selectedCategories, priceRange, selectedColors, selectedSizes]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="search-results-page">
      <div className="search-header">
        <h1>Search Results</h1>
        <p>Showing {results.length} results for "<b>{query}</b>"</p>
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
          {results.length > 0 ? (
            <ProductGrid title={`Matching Items`} products={results} />
          ) : (
            <div className="no-search-page-results">
              <h2>No products match your criteria</h2>
              <p>Try adjusting your search or filters.</p>
              <button className="btn-secondary" onClick={clearFilters} style={{marginTop: '1rem'}}>Clear Filters</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SearchResults;
