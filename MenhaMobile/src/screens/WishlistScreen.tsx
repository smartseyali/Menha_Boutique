import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import api from '../services/api';
import ProductList from '../components/ProductList';
import { useNavigation } from '@react-navigation/native';

const WishlistScreen = () => {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      // Mocked endpoint or actual if available
      // const response = await api.get('/wishlist');
      // setWishlist(response.data);
      
      // Temporary Mock
      setWishlist([]); 
    } catch (error) {
       console.error(error);
    } finally {
       setLoading(false);
    }
  };

  const handleProductPress = (item: any) => {
    navigation.navigate('ProductDetail', { productId: item.id });
  };

  if (loading) {
     return <View style={styles.center}><ActivityIndicator size="large" color="#E53935"/></View>;
  }

  if (wishlist.length === 0) {
      return (
          <View style={styles.center}>
              <Text style={{fontSize: 50}}>💔</Text>
              <Text style={styles.emptyText}>Your wishlist is empty</Text>
          </View>
      )
  }

  return (
    <View style={styles.container}>
       <ProductList data={wishlist} onPress={handleProductPress} />
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
    backgroundColor: '#fff',
  },
  emptyText: {
      marginTop: 20,
      fontSize: 16,
      color: '#888',
  }
});

export default WishlistScreen;
