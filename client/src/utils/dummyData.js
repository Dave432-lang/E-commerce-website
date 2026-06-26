const fashionImages = [
  'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80', // Leather jacket
  'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=800&q=80', // Dress
  'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80', // Sweater
  'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?auto=format&fit=crop&w=800&q=80', // Trousers
  'https://images.unsplash.com/photo-1434389678369-18361fc474cc?auto=format&fit=crop&w=800&q=80', // Men's shirt
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80', // Fashion model
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80', // T-shirt
  'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80'  // Summer dress
];

const categories = ['Outerwear', 'Dresses', 'Knitwear', 'Bottoms', 'Shirts', 'Accessories', 'Tops', 'Essentials'];
const adjectives = ['Minimalist', 'Silk Blend', 'Oversized', 'Tailored', 'Classic', 'Modern', 'Vintage', 'Premium'];
const nouns = ['Jacket', 'Slip Dress', 'Wool Sweater', 'Wide-Leg Trousers', 'Oxford Shirt', 'Tote Bag', 'Crop Top', 'T-Shirt'];

const generateProducts = (startIndex) => {
  const allSizes = ['XS', 'S', 'M', 'L', 'XL'];
  const allColors = ['Black', 'White', 'Beige', 'Navy', 'Olive'];

  return Array.from({ length: 8 }).map((_, i) => {
    // Generate random subset of sizes and colors for each product
    const productSizes = allSizes.filter(() => Math.random() > 0.3);
    if (productSizes.length === 0) productSizes.push('M'); // Ensure at least one size

    const productColors = allColors.filter(() => Math.random() > 0.4);
    if (productColors.length === 0) productColors.push('Black'); // Ensure at least one color

    return {
      id: startIndex + i,
      name: `${adjectives[(startIndex + i) % 8]} ${nouns[(startIndex + i + 2) % 8]}`,
      price: Math.floor(Math.random() * (300 - 40 + 1) + 40) + 0.99,
      rating: (Math.random() * (5.0 - 3.8) + 3.8).toFixed(1),
      category: categories[(startIndex + i) % 8],
      image: fashionImages[(startIndex + i) % 8],
      sizes: productSizes,
      colors: productColors
    };
  });
};

export const newArrivals = generateProducts(100);
export const bestSellers = generateProducts(200);
export const trendingNow = generateProducts(300);
