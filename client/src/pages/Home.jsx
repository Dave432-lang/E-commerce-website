import React, { useEffect, useState } from 'react';
import Hero from '../components/Hero';
import ProductGrid from '../components/ProductGrid';
import Loader from '../components/Loader/Loader';
import { productService } from '../services/productService';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeProducts = async () => {
      try {
        const data = await productService.getAllProducts();
        setProducts(data);
      } catch (error) {
        console.error('Failed to load products for homepage:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeProducts();
  }, []);

  // Split products for different sections
  // Using slices since we have 8 seeded products
  const newArrivals = products.slice(0, 4);
  const bestSellers = products.slice(4, 8);
  const trendingNow = products.slice(2, 6);

  return (
    <>
      <Hero />
      {loading ? (
        <Loader />
      ) : (
        <>
          {newArrivals.length > 0 && (
            <ProductGrid title="New Arrivals" products={newArrivals} />
          )}
          {bestSellers.length > 0 && (
            <ProductGrid title="Best Sellers" products={bestSellers} />
          )}
          {trendingNow.length > 0 && (
            <ProductGrid title="Trending Now" products={trendingNow} />
          )}
        </>
      )}
    </>
  );
};

export default Home;
