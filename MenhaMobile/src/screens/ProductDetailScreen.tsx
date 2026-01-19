import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Dimensions } from 'react-native';
import api from '../services/api';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const ProductDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { productId } = route.params;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      const response = await api.get(`/products/${productId}`);
      setProduct(response.data.product || response.data);
    } catch (error) {
    //   console.error(error);
    //   Alert.alert('Error', 'Could not load product details');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (goToCart = false) => {
    setAdding(true);
    try {
        // Here we ideally call API. For now, we will store in AsyncStorage or just Simulate
        // const res = await api.post('/cart', { product_id: product.id, quantity });
        
        // Simulating cart logic with AsyncStorage for Demo if offline or simple
        const currentCart = await AsyncStorage.getItem('cart');
        let cart = currentCart ? JSON.parse(currentCart) : [];
        const existingIndex = cart.findIndex((item: any) => item.id === product.id);
        
        if (existingIndex > -1) {
            cart[existingIndex].quantity += quantity;
        } else {
            cart.push({ ...product, quantity });
        }
        await AsyncStorage.setItem('cart', JSON.stringify(cart));

        if (goToCart) {
            navigation.navigate('Cart');
        } else {
            Alert.alert('Success', 'Added to cart!');
        }

    } catch (error) {
      Alert.alert('Error', 'Failed to add to cart');
    } finally {
        setAdding(false);
    }
  };

  const increment = () => setQuantity(prev => prev + 1);
  const decrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#E53935"/></View>;
  }

  if (!product) {
    return <View style={styles.center}><Text>Product not found</Text></View>;
  }

  const imageUrl = product.image || (product.images && product.images[0]?.url) || 'https://via.placeholder.com/300';
  const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;

  return (
    <View style={styles.container}>
      <ScrollView>
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />
        
        <View style={styles.content}>
          <Text style={styles.title}>{product.name}</Text>
          <View style={styles.ratingRow}>
              <Text style={styles.rating}>★ {product.rating || 4.8}</Text>
              <Text style={styles.reviews}>({product.reviews || 120} reviews)</Text>
          </View>
          
          <View style={styles.priceContainer}>
              <Text style={styles.price}>₹{product.price}</Text>
              {product.oldPrice && <Text style={styles.oldPrice}>₹{product.oldPrice}</Text>}
              {discount > 0 && <Text style={styles.discount}>{discount}% OFF</Text>}
          </View>

          {/* Quantity Selector */}
          <View style={styles.quantityContainer}>
              <Text style={styles.sectionTitle}>Quantity</Text>
              <View style={styles.counter}>
                  <TouchableOpacity onPress={decrement} style={styles.counterBtn}><Text style={styles.counterText}>-</Text></TouchableOpacity>
                  <Text style={styles.quantityText}>{quantity}</Text>
                  <TouchableOpacity onPress={increment} style={styles.counterBtn}><Text style={styles.counterText}>+</Text></TouchableOpacity>
              </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.descriptionHead}>Description</Text>
          <Text style={styles.description}>{product.description || 'No description available for this product.'}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cartButton} onPress={() => addToCart(false)} disabled={adding}>
          <Text style={[styles.btnText, {color: '#E53935'}]}>Add to Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyButton} onPress={() => addToCart(true)} disabled={adding}>
          <Text style={[styles.btnText, {color: '#fff'}]}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width,
    height: 300,
    backgroundColor: '#f9f9f9',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
  },
  rating: {
      backgroundColor: 'green',
      color: '#fff',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      fontSize: 12,
      fontWeight: 'bold',
      marginRight: 8,
  },
  reviews: {
      color: '#888',
      fontSize: 12,
  },
  priceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
  },
  price: {
    fontSize: 24,
    color: '#333',
    fontWeight: 'bold',
    marginRight: 10,
  },
  oldPrice: {
      fontSize: 16,
      color: '#999',
      textDecorationLine: 'line-through',
      marginRight: 10,
  },
  discount: {
      color: 'green',
      fontWeight: 'bold',
      fontSize: 14,
  },
  quantityContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
  },
  sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
  },
  counter: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
  },
  counterBtn: {
      paddingHorizontal: 15,
      paddingVertical: 8,
      backgroundColor: '#f0f0f0',
  },
  counterText: {
      fontSize: 18,
      fontWeight: 'bold',
  },
  quantityText: {
      paddingHorizontal: 15,
      fontSize: 16,
      fontWeight: 'bold',
  },
  divider: {
      height: 1,
      backgroundColor: '#eee',
      marginVertical: 15,
  },
  descriptionHead: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 10,
    backgroundColor: '#fff',
  },
  cartButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E53935',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginRight: 10,
  },
  buyButton: {
    flex: 1,
    backgroundColor: '#E53935',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  btnText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ProductDetailScreen;
