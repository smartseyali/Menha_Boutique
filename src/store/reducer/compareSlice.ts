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
  oldPrice: number;
  location: string;
  brand: string;
  sku: number;
  category: string;
  quantity: number;
}
export interface CounterState {
  compare: Item[];
}

const initialState: CounterState = {
  compare: [
    {
      title: "Black Pepper Spice pack",
      image: "/assets/img/new-product/5.jpg",
      imageTwo: "/assets/img/new-product/back-5.jpg",
      category: "Spices",
      oldPrice: 22,
      newPrice: 32,
      location: "In Store,online",
      brand: "D mart",
      sku: 24433,
      date: "",
      id: 5,
      quantity: 1,
      rating: 4,
      status: "Out Of Stock",
      weight: "1 pack",
    },
    {
      title: "Cardamom Spice Pack",
      image: "/assets/img/new-product/6.jpg",
      imageTwo: "/assets/img/new-product/back-6.jpg",
      category: "Spices",
      oldPrice: 45,
      newPrice: 41,
      location: "online",
      brand: 'D mart',
      sku: 24433,
      date: "",
      id: 6,
      quantity: 1,
      rating: 5,
      status: "In Stock",
      weight: "200g",
    },
    {
      title: "Chilli Flakes Pack",
      image: "/assets/img/new-product/7.jpg",
      imageTwo: "/assets/img/new-product/back-7.jpg",
      category: "Spices",
      oldPrice: 31,
      newPrice: 29,
      location: "In Store",
      brand: "D mart",
      sku: 24433,
      date: "",
      id: 7,
      quantity: 1,
      rating: 2,
      status: "In Stock",
      weight: "250g",
    },
  ],
};

export const compareSlice = createSlice({
  name: "compare",
  initialState,
  reducers: {
    setCompareItem(state, action: PayloadAction<Item>) {
      state.compare.push(action.payload);
    },

    addCompare(state, action: PayloadAction<Item>) {
      state.compare.push(action.payload);
    },
    removeCompareItem(state, action: PayloadAction<number>) {
      state.compare = state.compare.filter(
        (item) => item.id !== action.payload);

    },
  },
});

export const { addCompare, removeCompareItem, setCompareItem } = compareSlice.actions;
export default compareSlice.reducer;
