import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    // Try to get cart from localStorage
    const savedCart = localStorage.getItem('boutique_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Save cart to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('boutique_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1, size = 'M') => {
    setCartItems(prevItems => {
      // Check if item with same id and size exists
      const existingItemIndex = prevItems.findIndex(
        item => item.id === product.id && item.size === size
      );

      if (existingItemIndex >= 0) {
        // Update quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantity;
        return updatedItems;
      }

      // Add new item
      return [...prevItems, { ...product, quantity, size }];
    });
    
    // Automatically open the cart
    setIsCartOpen(true);
  };

  const removeFromCart = (id, size) => {
    setCartItems(prevItems => 
      prevItems.filter(item => !(item.id === id && item.size === size))
    );
  };

  const updateQuantity = (id, size, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCartItems(prevItems => {
      const updatedItems = [...prevItems];
      const itemIndex = updatedItems.findIndex(item => item.id === id && item.size === size);
      if (itemIndex >= 0) {
        updatedItems[itemIndex].quantity = newQuantity;
      }
      return updatedItems;
    });
  };

  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      cartTotal,
      cartCount,
      isCartOpen,
      setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
};
