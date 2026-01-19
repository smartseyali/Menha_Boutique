"use client";
import { Provider } from "react-redux";
import { store } from "./index";
import { SWRProvider } from "@/components/swr-config/SWRConfig";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUserData } from "./reducer/loginSlice";
import { authStorage } from "@/utils/authStorage";

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    // Initialize auth state from sessionStorage on app load
    if (authStorage.isAuthenticated()) {
      const userData = authStorage.getUserData();
      const token = authStorage.getToken();
      
      if (userData && token) {
        dispatch(setUserData({
          isAuthenticated: true,
          user: {
            id: userData.id,
            email: userData.email,
            phoneNumber: userData.phoneNumber,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role,
            token: token,
          }
        }));
      }
    }
  }, [dispatch]);

  return <>{children}</>;
}

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>
        <SWRProvider>
          {children}
        </SWRProvider>
      </AuthInitializer>
    </Provider>
  );
}

export default Providers;
