import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import api from '../services/api';

const CartScreen = () => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();

  // Reload cart whenever screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchCart();
    }, [])
  );

  const fetchCart = async () => {
    setLoading(true);
    try {
        // Ideally fetch from backend
        // const res = await api.get('/cart');
        // setCartItems(res.data);
        
        // Using local for now as per previous step logic
        const currentCart = await AsyncStorage.getItem('cart');
        setCartItems(currentCart ? JSON.parse(currentCart) : []);
    } catch (error) {
       console.error(error);
    } finally {
       setLoading(false);
    }
  };

  const updateQuantity = async (id: string, delta: number) => {
      const newCart = cartItems.map(item => {
          if (item.id === id) {
              return { ...item, quantity: Math.max(1, item.quantity + delta) };
          }
          return item;
      });
      setCartItems(newCart);
      await AsyncStorage.setItem('cart', JSON.stringify(newCart));
  };

  const removeItem = async (id: string) => {
      const newCart = cartItems.filter(item => item.id !== id);
      setCartItems(newCart);
      await AsyncStorage.setItem('cart', JSON.stringify(newCart));
  };

  const calculateTotal = () => {
      return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
          Alert.alert('Login Required', 'Please login to place your order.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Login', onPress: () => navigation.navigate('Login', { redirect: 'Checkout', cartItems, totalAmount: calculateTotal() }) }
          ]);
      } else {
          navigation.navigate('Checkout', { cartItems, totalAmount: calculateTotal() });
      }
  };

  const renderItem = ({ item }: { item: any }) => {
    const imageUrl = item.image || (item.images && item.images[0]?.url) || 'https://via.placeholder.com/150';
    return (
      <View style={styles.card}>
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        <View style={styles.details}>
          <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.price}>₹{item.price}</Text>
          
          <View style={styles.actions}>
              <View style={styles.counter}>
                  <TouchableOpacity onPress={() => updateQuantity(item.id, -1)} style={styles.counterBtn}>
                      <Text>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantity}>{item.quantity}</Text>
                  <TouchableOpacity onPress={() => updateQuantity(item.id, 1)} style={styles.counterBtn}>
                      <Text>+</Text>
                  </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => removeItem(item.id)}>
                  <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#E53935"/></View>;
  }

  if (cartItems.length === 0) {
      return (
          <View style={styles.center}>
              <Text style={{fontSize: 50}}>🛒</Text>
              <Text style={styles.emptyText}>Your cart is empty</Text>
              <TouchableOpacity style={styles.shopNowBtn} onPress={() => navigation.navigate('Home')}>
                  <Text style={styles.shopNowText}>Shop Now</Text>
              </TouchableOpacity>
          </View>
      );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cartItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
      />
      <View style={styles.footer}>
          <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>₹{calculateTotal()}</Text>
          </View>
          <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
              <Text style={styles.checkoutText}>Proceed to Checkout</Text>
          </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  emptyText: {
      marginTop: 20,
      fontSize: 18,
      color: '#888',
      marginBottom: 20,
  },
  shopNowBtn: {
      paddingHorizontal: 30,
      paddingVertical: 12,
      backgroundColor: '#E53935',
      borderRadius: 25,
  },
  shopNowText: {
      color: '#fff',
      fontWeight: 'bold',
  },
  list: {
    padding: 10,
    paddingBottom: 100,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 8,
    padding: 10,
    elevation: 1,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 4,
    marginRight: 15,
  },
  details: {
    flex: 1,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  actions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 10,
  },
  counter: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#eee',
      borderRadius: 4,
  },
  counterBtn: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      backgroundColor: '#f9f9f9',
  },
  quantity: {
      paddingHorizontal: 10,
      fontWeight: 'bold',
  },
  removeText: {
      color: 'red',
      fontSize: 12,
  },
  footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#fff',
      padding: 15,
      borderTopWidth: 1,
      borderTopColor: '#eee',
      elevation: 5,
  },
  totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 15,
  },
  totalLabel: {
      fontSize: 18,
      color: '#555',
  },
  totalValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#E53935',
  },
  checkoutBtn: {
      backgroundColor: '#E53935', // Enterprise Red/Brand Color
      padding: 15,
      borderRadius: 8,
      alignItems: 'center',
  },
  checkoutText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
  }
});

export default CartScreen;
