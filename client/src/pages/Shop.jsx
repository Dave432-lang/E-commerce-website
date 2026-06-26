import React, { useState, useEffect, useMemo } from 'react';
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

  useEffect(() => {
    const fetchShopProducts = async () => {
      try {
        const data = await productService.getAllProducts();
        setProducts(data);
      } catch (error) {
        console.error('Failed to load shop products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShopProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = products.filter(product => {
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
      const matchesPrice = Number(product.price) <= priceRange;
      const matchesColor = selectedColors.length === 0 || (product.colors && product.colors.some(c => selectedColors.includes(c)));
      const matchesSize = selectedSizes.length === 0 || (product.sizes && product.sizes.some(s => selectedSizes.includes(s)));
      return matchesCategory && matchesPrice && matchesColor && matchesSize;
    });

    if (sortBy === 'price-low') result.sort((a, b) => Number(a.price) - Number(b.price));
    if (sortBy === 'price-high') result.sort((a, b) => Number(b.price) - Number(a.price));
    if (sortBy === 'rating') result.sort((a, b) => Number(b.rating) - Number(a.rating));

    return result;
  }, [products, selectedCategories, priceRange, sortBy, selectedColors, selectedSizes]);

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
