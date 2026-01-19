import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
interface Item {
  id: number;
  date: string
  title: string;
  newPrice: number;
  weight: string;
  image: string;
  imageTwo: string;
  status: string;
  rating: number;
  oldPrice: number;
  location: string;
  brand: string;
  sku: number;
  category: string;
  quantity: number;
}

export interface CounterState {
  wishlist: Item[];
}

const initialState: CounterState = {
  wishlist: [],
};

export const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    setWishlistItems(state, action: PayloadAction<Item[]>) {
      state.wishlist = action.payload;
      // No localStorage - wishlist is stored in database via API
    },
    addWishlist(state, action: PayloadAction<Item>) {
      state.wishlist.push(action.payload);
      // No localStorage - wishlist is stored in database via API
    },
    removeWishlist(state, action: PayloadAction<number | string>) {
      state.wishlist = state.wishlist.filter(
        (item) => item.id !== action.payload);
      // No localStorage - wishlist is stored in database via API
    },
  },
});

export const { addWishlist, removeWishlist, setWishlistItems } = wishlistSlice.actions;

export default wishlistSlice.reducer;
