import React, { useState, useEffect, useCallback } from 'react';
import ProductGrid from '../components/ProductGrid';
import ProductFilters from '../components/ProductFilters';
import Loader from '../components/Loader/Loader';
import { productService } from '../services/productService';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid';
import ProductFilters from '../components/ProductFilters';
import Loader from '../components/Loader/Loader';
import { productService } from '../services/productService';

const WOMEN_CATEGORIES = ['Dresses', 'Tops', 'Trousers', 'Skirts', 'Jeans', 'Shoes', 'Bags', 'Accessories', 'Outerwear', 'Knitwear'];
const MEN_CATEGORIES = ['T-Shirts', 'Shirts', 'Trousers', 'Jeans', 'Shorts', 'Shoes', 'Watches', 'Accessories', 'Outerwear'];
const ALL_CATEGORIES = Array.from(new Set([...WOMEN_CATEGORIES, ...MEN_CATEGORIES]));

const Shop = ({ initialDepartment, initialOnSale, initialNewArrival }) => {
  const [searchParams] = useSearchParams();
  
  const paramGender = searchParams.get('gender');
  const paramOnSale = searchParams.get('onSale') === 'true';
  const paramNewArrival = searchParams.get('new') === 'true' || searchParams.get('isNewArrival') === 'true';

  const [department, setDepartment] = useState(initialDepartment || paramGender || 'all');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState(2000);
  const [sortBy, setSortBy] = useState('featured');
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSale, setOnSale] = useState(initialOnSale || paramOnSale || false);
  const [isNewArrival, setIsNewArrival] = useState(initialNewArrival || paramNewArrival || false);

  const allColors = ['Black', 'White', 'Beige', 'Navy', 'Olive', 'Brown', 'Blue', 'Gold'];
  const allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  // Categories depending on department
  const activeCategories = department === 'women'
    ? WOMEN_CATEGORIES
    : department === 'men'
    ? MEN_CATEGORIES
    : ALL_CATEGORIES;

  // Fetch from server whenever any filter changes
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productService.getFilteredProducts({
        gender: department === 'all' ? '' : department,
        categories: selectedCategories,
        colors: selectedColors,
        sizes: selectedSizes,
        maxPrice: priceRange,
        onSale,
        isNewArrival,
        inStockOnly,
        sortBy
      });
      setProducts(data);
    } catch (error) {
      console.error('Failed to load shop products:', error);
    } finally {
      setLoading(false);
    }
  }, [department, selectedCategories, selectedColors, selectedSizes, priceRange, onSale, isNewArrival, inStockOnly, sortBy]);

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
    setDepartment('all');
    setSelectedCategories([]);
    setPriceRange(2000);
    setSelectedColors([]);
    setSelectedSizes([]);
    setInStockOnly(false);
    setOnSale(false);
    setIsNewArrival(false);
    setSortBy('featured');
  };

  const getPageTitle = () => {
    if (department === 'women') return "Women's Collection";
    if (department === 'men') return "Men's Collection";
    if (onSale) return "On Sale & Offers";
    if (isNewArrival) return "New Arrivals";
    return "All Boutique Collections";
  };

  return (
    <div className="shop-page">
      <div className="shop-header">
        <h1>{getPageTitle()}</h1>
        <p>Curated Ghanaian luxury apparel & contemporary fashion styled for you (GH₵)</p>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="shop-container">
          {/* Sidebar Filters */}
          <ProductFilters
            department={department}
            setDepartment={setDepartment}
            categories={activeCategories}
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
            inStockOnly={inStockOnly}
            setInStockOnly={setInStockOnly}
            onSale={onSale}
            setOnSale={setOnSale}
            isNewArrival={isNewArrival}
            setIsNewArrival={setIsNewArrival}
            clearFilters={clearFilters}
          />

          {/* Main Content */}
          <main className="shop-main">
            <div className="shop-toolbar">
              <p className="results-count">{products.length} Items Found</p>
              <div className="sort-dropdown">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="featured">Featured First</option>
                  <option value="newest">Newest Arrivals</option>
                  <option value="price-low">Price: Low to High (GH₵)</option>
                  <option value="price-high">Price: High to Low (GH₵)</option>
                  <option value="rating">Customer Rating</option>
                </select>
              </div>
            </div>

            {products.length > 0 ? (
              <ProductGrid products={products} />
            ) : (
              <div className="no-results">
                <h3>No items match your criteria</h3>
                <p>Try adjusting your search or filters to see more results.</p>
                <button className="btn-secondary" onClick={clearFilters} style={{ marginTop: '1rem' }}>Clear All Filters</button>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
};

export default Shop;
