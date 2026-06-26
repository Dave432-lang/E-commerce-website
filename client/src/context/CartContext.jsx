import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartService } from '../services/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('boutique_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync cart from DB on mount / when user logs in
  useEffect(() => {
    const syncAndFetchCart = async () => {
      if (user) {
        try {
          // If there are guest cart items in localStorage, sync them first!
          const guestCart = localStorage.getItem('boutique_cart');
          const parsedGuestCart = guestCart ? JSON.parse(guestCart) : [];

          if (parsedGuestCart.length > 0) {
            console.log('Merging local guest cart with database...');
            await cartService.syncCart(parsedGuestCart);
            // Clear local storage cart once merged to prevent double merging
            localStorage.removeItem('boutique_cart');
          }

          // Fetch the consolidated database cart
          const dbItems = await cartService.getCartItems();
          setCartItems(dbItems);
        } catch (error) {
          console.error('Failed to sync/retrieve database cart:', error);
        }
      } else {
        // Logged out, load local guest cart if exists
        const savedCart = localStorage.getItem('boutique_cart');
        setCartItems(savedCart ? JSON.parse(savedCart) : []);
      }
    };

    syncAndFetchCart();
  }, [user]);

  // Save guest cart to local storage whenever it changes (only for guest users)
  useEffect(() => {
    if (!user) {
      localStorage.setItem('boutique_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  const addToCart = async (product, quantity = 1, size = 'M', color = 'Default') => {
    const selectedSize = size || 'M';
    const selectedColor = color || 'Default';

    // 1. Immediately update UI state for maximum speed & responsiveness
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(
        item => item.id === product.id && item.size === selectedSize && item.color === selectedColor
      );

      if (existingItemIndex >= 0) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantity;
        return updatedItems;
      }

      return [...prevItems, { ...product, quantity, size: selectedSize, color: selectedColor }];
    });
    
    // Automatically open the cart drawer
    setIsCartOpen(true);

    // 2. Perform database call in the background if authenticated
    if (user) {
      try {
        await cartService.addToCart(product.id, quantity, selectedSize, selectedColor);
      } catch (error) {
        console.error('Failed to add cart item to database:', error);
      }
    }
  };

  const removeFromCart = async (id, size, color = 'Default') => {
    const selectedSize = size || 'M';
    const selectedColor = color || 'Default';

    // 1. Instantly update UI state
    setCartItems(prevItems => 
      prevItems.filter(item => !(item.id === id && item.size === selectedSize && item.color === selectedColor))
    );

    // 2. Background database deletion
    if (user) {
      try {
        await cartService.removeFromCart(id, selectedSize, selectedColor);
      } catch (error) {
        console.error('Failed to remove cart item from database:', error);
      }
    }
  };

  const updateQuantity = async (id, size, color = 'Default', newQuantity) => {
    if (newQuantity < 1) return;
    const selectedSize = size || 'M';
    const selectedColor = color || 'Default';
    
    // 1. Instantly update UI state
    setCartItems(prevItems => {
      const updatedItems = [...prevItems];
      const itemIndex = updatedItems.findIndex(
        item => item.id === id && item.size === selectedSize && item.color === selectedColor
      );
      if (itemIndex >= 0) {
        updatedItems[itemIndex].quantity = newQuantity;
      }
      return updatedItems;
    });

    // 2. Background database quantity modification
    if (user) {
      try {
        await cartService.updateCartItem(id, newQuantity, selectedSize, selectedColor);
      } catch (error) {
        console.error('Failed to update database cart item quantity:', error);
      }
    }
  };

  const updateSize = async (id, oldSize, newSize, color = 'Default') => {
    const selectedColor = color || 'Default';

    // 1. Local state update and merge logic
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(
        item => item.id === id && item.size === newSize && item.color === selectedColor
      );
      const currentItemIndex = prevItems.findIndex(
        item => item.id === id && item.size === oldSize && item.color === selectedColor
      );
      
      if (currentItemIndex === -1) return prevItems;

      const updatedItems = [...prevItems];
      
      if (existingItemIndex >= 0 && existingItemIndex !== currentItemIndex) {
        // Merge quantities and remove old item
        updatedItems[existingItemIndex].quantity += updatedItems[currentItemIndex].quantity;
        updatedItems.splice(currentItemIndex, 1);
      } else {
        // Just update size
        updatedItems[currentItemIndex].size = newSize;
      }
      
      return updatedItems;
    });

    // 2. DB sync: delete old and recreate/update new item in the database
    if (user) {
      try {
        // Find current quantity of the item
        const itemToUpdate = cartItems.find(
          item => item.id === id && item.size === oldSize && item.color === selectedColor
        );
        if (itemToUpdate) {
          await cartService.removeFromCart(id, oldSize, selectedColor);
          await cartService.addToCart(id, itemToUpdate.quantity, newSize, selectedColor);
        }
      } catch (error) {
        console.error('Failed to sync updated cart item size in database:', error);
      }
    }
  };

  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      setCartItems,
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      updateSize,
      cartTotal,
      cartCount,
      isCartOpen,
      setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
};
