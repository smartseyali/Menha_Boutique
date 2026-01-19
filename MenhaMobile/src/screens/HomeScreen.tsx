import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet, ActivityIndicator, SafeAreaView, Platform, StatusBar as RNStatusBar, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';

// Components
import Header from '../components/Header';
import Banner from '../components/Banner';
import CategoryRow from '../components/CategoryRow';
import ProductList from '../components/ProductList';
import SectionHeader from '../components/SectionHeader';

interface Product {
  id: string;
  name: string;
  title?: string;
  price: number;
  newPrice?: number;
  oldPrice?: number;
  description: string;
  image?: string;
  images?: { url: string }[];
  rating?: number;
  reviews?: number;
  sale?: string;
  category?: string;
  weight?: string;
  location?: string;
}

interface Category {
  id: string;
  name: string;
  image?: string;
}

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [banners, setBanners] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [bestSelling, setBestSelling] = useState<Product[]>([]);

  const fetchData = async () => {
    try {
      // Fetch Banners
      // Note: Backend /banners returns banners. We might need to filter by type if needed, but here we take all or slice.
      const bannersRes = await api.get('/banners').catch(err => ({ data: [] }));
      const bannersData = Array.isArray(bannersRes.data) ? bannersRes.data : [];
      // Map banner data to match Banner component expectation if needed
      // Banner component expects: image, id. Backend returns image_url.
      const mappedBanners = bannersData.map((b: any) => ({
          id: b.id,
          image: b.image_url,
          name: b.title || '',
          link: b.link
      }));
      setBanners(mappedBanners.length > 0 ? mappedBanners : []); // If empty, we might fallback or show nothing

      // Fetch Categories
      const categoriesRes = await api.get('/categories').catch(err => ({ data: [] }));
      const categoriesData = Array.isArray(categoriesRes.data) ? categoriesRes.data : [];
      setCategories(categoriesData);

      // Fetch Products (New Arrivals / All)
      const productsRes = await api.get('/products').catch(err => ({ data: [] }));
      // Backend might return { products: [...] } or just [...]
      const productsData = productsRes.data.products || (Array.isArray(productsRes.data) ? productsRes.data : []);
      setProducts(productsData);

      // Fetch Best Selling
      const bestSellingRes = await api.get('/products/bestselling').catch(err => ({ data: [] }));
      const bestSellingData = Array.isArray(bestSellingRes.data) ? bestSellingRes.data : [];
      setBestSelling(bestSellingData.length > 0 ? bestSellingData : productsData.slice(0, 4));

    } catch (error) {
      console.error('Error fetching data:', error);
      // Alert.alert('Error', 'Could not fetch data. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const handleProductPress = (item: Product) => {
    navigation.navigate('ProductDetail', { productId: item.id });
  };

  const handleCategoryPress = (item: Category) => {
      // Navigate to category product list or filter (Placeholder)
      Alert.alert("Category", `Clicked ${item.name}`);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E53935" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Header />
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Banners */}
          {banners.length > 0 && <Banner data={banners} onPress={() => {}} />}

          {/* Categories */}
          <CategoryRow data={categories} onPress={handleCategoryPress} />

          {/* Best Selling Section */}
          {bestSelling.length > 0 && (
            <>
               <SectionHeader title="Best Selling" />
               <ProductList data={bestSelling} onPress={handleProductPress} />
            </>
          )}

          {/* All Products Section */}
          <SectionHeader title="New Arrivals" />
          <ProductList data={products} onPress={handleProductPress} />
          
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 20,
  },
});

export default HomeScreen;
