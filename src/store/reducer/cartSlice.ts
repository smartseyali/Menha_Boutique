import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface Item {
    id: number;
    title: string;
    newPrice: number;
    weight: string;
    image: string;
    imageTwo: string;
    date: string;
    status: string;
    rating: number;
    oldPrice: any;
    location: string;
    brand: string;
    sku: number;
    category: string;
    quantity: number;
    cartItemId? : string;
}
export interface CounterState {
    items: Item[];
    orders: object[];
    isCartOpen: boolean;
}

const initialState: CounterState = {
    items: [],
    orders: [],
    isCartOpen: false,
};

export const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        setItems(state, action: PayloadAction<Item[]>) {
            state.items = action.payload;
            // No localStorage - cart is stored in database
        },
        addItem(state, action: PayloadAction<Item>) {
            state.items.push(action.payload);
            // No localStorage - cart is stored in database via API
        },
        removeItem(state, action: PayloadAction<number | string>) {
            state.items = state.items.filter((item) => item.id !== action.payload);
            // No localStorage - cart is stored in database via API
        },
        clearCart: (state) => {
            state.items = [];
            // No localStorage - cart is stored in database via API
        },
        updateQuantity: (
            state,
            action: PayloadAction<{ id: number | string; quantity: number }>
        ) => {
            const { id, quantity } = action.payload;
            const itemToUpdate = state.items.find((item) => item.id === id);
            if (itemToUpdate) {
                itemToUpdate.quantity = quantity;
                // No localStorage - cart is stored in database via API
            }
        },
        updateItemQuantity: (state, action) => {
            state.items = action.payload;
            // No localStorage - cart is stored in database via API
        },
        addOrder(state, action: PayloadAction<any>) {
            const newOrder = action.payload;
            state.orders = [...state.orders, newOrder];
            // No localStorage - orders are stored in database via API
        },
        setOrders(state, action: PayloadAction<any[]>) {
            state.orders = action.payload;
            // No localStorage - orders are stored in database via API
        },
        setCartOpen(state, action: PayloadAction<boolean>) {
            state.isCartOpen = action.payload;
        },
    },
});

export const {
    setItems,
    addItem,
    removeItem,
    clearCart,
    updateQuantity,
    updateItemQuantity,
    addOrder,
    setOrders,
    setCartOpen
} = cartSlice.actions;

export default cartSlice.reducer;