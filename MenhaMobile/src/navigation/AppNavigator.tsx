import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons'; // Ensure typical Expo icons

// Screens
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CartScreen from '../screens/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';
import WishlistScreen from '../screens/WishlistScreen';
import OrdersScreen from '../screens/OrdersScreen';
import CheckoutScreen from '../screens/CheckoutScreen';

// Types
export type RootStackParamList = {
  MainTabs: undefined;
  Login: { setIsAuthenticated?: (val: boolean) => void };
  ProductDetail: { productId: string };
  Checkout: { cartItems: any[], totalAmount: number };
  Orders: undefined;
  Wishlist: undefined;
};

// Navigators
const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// 1. Define Bottom Tab Navigator
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#E53935',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Category') { // Placeholder if we add a Category Screen
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Cart') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Wishlist') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          // You can replace Ionicons with any other icon library if prefered
          // This requires 'react-native-vector-icons' or '@expo/vector-icons'
          // We'll assume a standard wrapper or direct usage.
          // Since we installed vector-icons in package.json, this should work if linked or in Expo.
          // For safety in standard react-native we might need <Icon /> component.
          // Using simple Text emoji as fallback if Icon fails to render in some envs
          // return <Text style={{color, fontSize: size}}>{iconName === 'home' ? '🏠' : '👤'}</Text>
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      {/* <Tab.Screen name="Category" component={CategoryScreen} /> */} 
      <Tab.Screen name="Wishlist" component={WishlistScreen} />
      <Tab.Screen name="Cart" component={CartScreen} options={{ tabBarBadge: 3 }} /> 
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// 2. Define Main Stack Navigator (Wraps Tabs + Other Screens)
const AppNavigator = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        setIsAuthenticated(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      // Short delay to prevent flicker if needed, or just set loading false
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
        <ActivityIndicator size="large" color="#E53935" />
      </View>
    );
  }

  return (
    <Stack.Navigator initialRouteName="MainTabs">
        {/* Main Tabs (Home, Profile, etc.) - Always visible first */}
        <Stack.Screen 
            name="MainTabs" 
            component={MainTabs} 
            options={{ headerShown: false }} 
        />
        
        {/* Auth Screens */}
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }} 
          initialParams={{ setIsAuthenticated }}
        />

        {/* Detail & Stack Screens */}
        <Stack.Screen 
            name="ProductDetail" 
            component={ProductDetailScreen} 
            options={{ title: 'Product Details' }} 
        />
        
        <Stack.Screen 
            name="Checkout"  
            component={CheckoutScreen} 
            options={{ title: 'Checkout' }} 
        />
        
        <Stack.Screen 
            name="Orders" 
            component={OrdersScreen} 
            options={{ title: 'My Orders' }} 
        /> 
    </Stack.Navigator>
  );
};

export default AppNavigator;
