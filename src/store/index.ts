import { configureStore } from "@reduxjs/toolkit";
import cartSlice from "./reducer/cartSlice";
import compareSlice from "./reducer/compareSlice";
import wishlistSlice from "./reducer/wishlistSlice";
import loginSlice from "./reducer/loginSlice";
import filterReducer from "./reducer/filterReducer";

export const store = configureStore({
    reducer: {
        cart: cartSlice,
        wishlist: wishlistSlice,
        compare: compareSlice,
        login: loginSlice,
        filter: filterReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
