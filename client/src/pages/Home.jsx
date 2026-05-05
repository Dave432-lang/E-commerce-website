import React from 'react';
import Hero from '../components/Hero';
import ProductGrid from '../components/ProductGrid';
import { newArrivals, bestSellers, trendingNow } from '../utils/dummyData';

const Home = () => {
  return (
    <>
      <Hero />
      <ProductGrid title="New Arrivals" products={newArrivals} />
      <ProductGrid title="Best Sellers" products={bestSellers} />
      <ProductGrid title="Trending Now" products={trendingNow} />
    </>
  );
};

export default Home;
