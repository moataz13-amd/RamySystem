import React, { createContext, useContext, useState, useReducer } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    const addToCart = (product) => {
        setCart((prev) => {
            const existingItem = prev.find((item) => item._id === product._id);
            if (existingItem) {
                return prev.map((item) => {
                    if (item._id === product._id) {
                        const maxStock = product.stock !== undefined ? product.stock : Infinity;
                        const newQuantity = item.quantity + (product.quantity || 1);
                        return { ...item, quantity: Math.min(newQuantity, maxStock) };
                    }
                    return item;
                });
            }
            return [...prev, { ...product, quantity: Math.min(product.quantity || 1, product.stock !== undefined ? product.stock : Infinity) }];
        });
    };

    const removeFromCart = (id) => {
        setCart((prev) => prev.filter((item) => item._id !== id));
    };

    const updateQuantity = (id, quantity) => {
        if (quantity < 1) return;
        setCart((prev) =>
            prev.map((item) => {
                if (item._id === id) {
                    const maxStock = item.stock !== undefined ? item.stock : Infinity;
                    return { ...item, quantity: Math.min(quantity, maxStock) };
                }
                return item;
            })
        );
    };

    const clearCart = () => setCart([]);

    const isCartOpen = useState(false);

    return (
        <CartContext.Provider
            value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
