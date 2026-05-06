import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid';
import { newArrivals, bestSellers, trendingNow } from '../utils/dummyData';

const SearchResults = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q') || '';
  
  const allProducts = useMemo(() => [...newArrivals, ...bestSellers, ...trendingNow], []);

  const results = useMemo(() => {
    if (!query) return [];
    return allProducts.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) || 
      p.category.toLowerCase().includes(query.toLowerCase())
    );
  }, [allProducts, query]);

  return (
    <div className="search-results-page">
      <div className="search-header">
        <h1>Search Results</h1>
        <p>Showing {results.length} results for "<b>{query}</b>"</p>
      </div>

      <div className="search-container-results">
        {results.length > 0 ? (
          <ProductGrid products={results} />
        ) : (
          <div className="no-search-page-results">
            <h2>No products found</h2>
            <p>Try searching for something else like "Dress" or "Jacket"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
