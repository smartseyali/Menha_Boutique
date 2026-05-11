import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Dimensions, StatusBar, SafeAreaView, Platform, TextInput } from 'react-native';
import api, { MainAPI } from '../services/api';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, THEME } from '../constants/theme';

const { width } = Dimensions.get('window');

import { resolveImageUrl } from '../utils/imageUtils';

import { useCart } from '../context/CartContext';

const ProductDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { productId } = route.params || {}; // Safety check
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const { updateCartCount } = useCart();

  useEffect(() => {
    checkUser();
    if (productId) {
        fetchProductDetails();
    }
  }, [productId]);
  
  const checkUser = async () => {
      const token = await AsyncStorage.getItem('auth_token');
      setUserToken(token);
  };
  
  const fetchProductDetails = async () => {
    try {
      const productData = await MainAPI.fetchProductById(productId);
      setProduct(productData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (goToCart = false) => {
    setAdding(true);
    try {
        // Since mobile doesn't have a backend cart table yet (it uses local storage for guest or syncs later)
        // Let's use local storage for cart as well, or implement a sync.
        // The web app uses localStorage.
        const cartJson = await AsyncStorage.getItem('mb_cart') || '[]';
        let cart = JSON.parse(cartJson);
        const existing = cart.find((item: any) => item.product.id === product.id);
        if (existing) {
            existing.quantity += quantity;
        } else {
            cart.push({ product, quantity });
        }
        await AsyncStorage.setItem('mb_cart', JSON.stringify(cart));
        await updateCartCount();

        if (goToCart) {
            navigation.navigate('Cart');
        } else {
            Alert.alert('Success', 'Added to cart!');
        }

    } catch (error: any) {
        console.error('Add to cart error:', error);
        Alert.alert('Error', 'Failed to add to cart');
    } finally {
        setAdding(false);
    }
  };



  const increment = () => setQuantity(prev => prev + 1);
  const decrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleReviewSubmit = async () => {
      if (!commentInput.trim()) {
          Alert.alert('Error', 'Please enter a review comment');
          return;
      }
      setSubmittingReview(true);
      try {
          await MainAPI.submitReview({
              product_id: product.id,
              rating: ratingInput,
              comment: commentInput
          });
          Alert.alert('Success', 'Review submitted successfully!');
          setCommentInput('');
          setRatingInput(5);
          fetchProductDetails(); // Refresh product to show new review
      } catch (error) {
          Alert.alert('Error', 'Could not submit review. Please try again.');
      } finally {
          setSubmittingReview(false);
      }
  };

  if (loading) {
      return (
          <View style={styles.center}>
              <ActivityIndicator size="large" color={COLORS.accent} />
          </View>
      );
  }

  if (!product) {
    return <View style={styles.center}><Text>Product not found</Text></View>;
  }

  // Handle Image Resolution
  const rawImageUrl = 
    product.primary_image || 
    product.primaryImage || 
    (product.images && product.images.length > 0 ? (product.images[0].image_url || product.images[0].imageUrl || product.images[0].url) : null) || 
    product.image;

  const imageUrl = resolveImageUrl(rawImageUrl);

  const displayPrice = product.new_price || product.newPrice || product.price;
  const displayOldPrice = product.old_price || product.oldPrice;

  const discount = displayOldPrice ? Math.round(((displayOldPrice - displayPrice) / displayOldPrice) * 100) : 0;
  const rating = product.rating || 4.8;
  const reviewCount = product.reviews ? product.reviews.length : (product.reviewCount || 120);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Icons Overlay */}
        <View style={styles.headerOverlay}>
            <View /> {/* Empty view to keep right icons aligned to the right */}
            <View style={{flexDirection: 'row'}}>
                <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Cart')}>
                    <Ionicons name="cart-outline" size={24} color="#333" />
                </TouchableOpacity>
            </View>
        </View>

        <View style={styles.imageWrapper}>
             <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
                <Image source={{ uri: imageUrl }} style={[styles.image, { width, height: width }]} resizeMode="contain" />
                {product.additional_images && product.additional_images.map((img: any, idx: number) => (
                    <Image key={idx} source={{ uri: resolveImageUrl(img.image_url || img.imageUrl) }} style={[styles.image, { width, height: width }]} resizeMode="contain" />
                ))}
             </ScrollView>
             {discount > 0 && (
                 <View style={styles.discountBadge}>
                     <Text style={styles.discountText}>{discount}% OFF</Text>
                 </View>
             )}
        </View>
        
        <View style={styles.content}>
          <Text style={styles.category}>{product.categories?.name || product.category_name || 'Snacks & Sweets'}</Text>
          <Text style={styles.title}>{product.name || product.title}</Text>
          
          <View style={styles.metaRow}>
              <View style={styles.ratingBox}>
                  <Text style={styles.ratingText}>{rating} ★</Text>
                  <Text style={styles.reviewText}> | {product.reviews?.length || 0} reviews</Text>
              </View>
              
              <View style={styles.stockStatus}>
                  <Text style={styles.inStock}>In Stock</Text>
              </View>
          </View>
          
          <View style={styles.priceContainer}>
              <Text style={styles.price}>₹{displayPrice}</Text>
              {displayOldPrice && <Text style={styles.oldPrice}>₹{displayOldPrice}</Text>}
              <Text style={styles.taxText}>(Incl. of all taxes)</Text>
          </View>

          <View style={styles.divider} />

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
              <Text style={styles.sectionTitle}>Quantity</Text>
              <View style={styles.counter}>
                  <TouchableOpacity onPress={decrement} style={styles.counterBtn}>
                      <Ionicons name="remove" size={20} color="#333" />
                  </TouchableOpacity>
                  <Text style={styles.quantityValue}>{quantity}</Text>
                  <TouchableOpacity onPress={increment} style={styles.counterBtn}>
                      <Ionicons name="add" size={20} color="#333" />
                  </TouchableOpacity>
              </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.descriptionHead}>Product Description</Text>
          <Text style={styles.description}>{product.description || 'Experience the authentic taste of tradition with our premium quality products made from natural ingredients.'}</Text>
          
           {/* Additional Info / Delivery Placeholder */}
           <View style={styles.deliveryInfo}>
               <Ionicons name="cube-outline" size={20} color="#666" style={{marginRight:8}} />
               <Text style={styles.deliveryText}>Standard Delivery: 2-3 Days</Text>
           </View>

           {/* Reviews Section */}
           <View style={styles.divider} />
           <Text style={styles.descriptionHead}>Customer Reviews</Text>
           
           {userToken && (
               <View style={styles.reviewForm}>
                   <Text style={styles.reviewFormTitle}>Write a Review</Text>
                   <View style={styles.starSelector}>
                       {[1, 2, 3, 4, 5].map((star) => (
                           <TouchableOpacity key={star} onPress={() => setRatingInput(star)} style={{padding: 5}}>
                               <Ionicons 
                                   name={star <= ratingInput ? "star" : "star-outline"} 
                                   size={28} 
                                   color={COLORS.warning} 
                               />
                           </TouchableOpacity>
                       ))}
                   </View>
                   <TextInput 
                       style={styles.reviewInput}
                       placeholder="What did you think about this product?"
                       multiline
                       numberOfLines={3}
                       value={commentInput}
                       onChangeText={setCommentInput}
                   />
                   <TouchableOpacity 
                       style={[styles.submitReviewBtn, submittingReview && {opacity: 0.7}]} 
                       onPress={handleReviewSubmit}
                       disabled={submittingReview}
                   >
                       {submittingReview ? (
                           <ActivityIndicator color="#fff" size="small" />
                       ) : (
                           <Text style={styles.submitReviewText}>Submit Review</Text>
                       )}
                   </TouchableOpacity>
               </View>
           )}

           {product.reviews && product.reviews.length > 0 ? (
               <>
                {product.reviews.map((rev: any, idx: number) => (
                    <View key={idx} style={styles.reviewCard}>
                        <View style={styles.reviewHeader}>
                            <Text style={styles.reviewerName}>{rev.users?.first_name} {rev.users?.last_name}</Text>
                            <Text style={styles.reviewRating}>{rev.rating} ★</Text>
                        </View>
                        <Text style={styles.reviewComment}>{rev.comment}</Text>
                        <Text style={styles.reviewDate}>{new Date(rev.created_at).toLocaleDateString()}</Text>
                    </View>
                ))}
               </>
           ) : (
               <Text style={styles.description}>No reviews yet.</Text>
           )}
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.footer}>
        <View style={styles.footerBtnContainer}>
            <TouchableOpacity style={styles.addToCartBtn} onPress={() => addToCart(false)} disabled={adding}>
            <Text style={styles.addToCartText}>Add to Cart</Text>
            </TouchableOpacity>
        </View>
        
        <View style={styles.footerBtnContainer}>
            <TouchableOpacity onPress={() => addToCart(true)} disabled={adding} style={{flex:1}}>
                <LinearGradient
                    colors={THEME.gradients.primary as any}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buyBtn}
                >
                    <Text style={styles.buyBtnText}>Buy Now</Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
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
  scrollContent: {
      paddingBottom: 100,
  },
  headerOverlay: {
      position: 'absolute',
      top: 10,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 15,
      zIndex: 10,
  },
  iconBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.9)',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      elevation: 2,
  },
  imageWrapper: {
      width: width,
      height: width, // Square aspect ratio
      backgroundColor: '#f9f9f9',
      position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
      position: 'absolute',
      bottom: 20,
      left: 20,
      backgroundColor: COLORS.accent,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 4,
  },
  discountText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 12,
  },
  content: {
    padding: 20,
  },
  category: {
      fontSize: 12,
      color: '#888',
      textTransform: 'uppercase',
      marginBottom: 5,
      letterSpacing: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
    color: '#1a1a1a',
    lineHeight: 32,
  },
  metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 15,
  },
  ratingBox: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  ratingText: {
      fontSize: 14,
      fontWeight: 'bold',
      color: COLORS.warning,
  },
  reviewText: {
      color: '#888',
      fontSize: 13,
      marginLeft: 5,
  },
  stockStatus: {
      backgroundColor: '#e6f4ea',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 4,
  },
  inStock: {
      color: COLORS.success,
      fontSize: 12,
      fontWeight: '600',
  },
  priceContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
      marginBottom: 5,
  },
  price: {
    fontSize: 28,
    color: COLORS.primary, // Brand green
    fontWeight: '700',
    marginRight: 10,
  },
  oldPrice: {
      fontSize: 16,
      color: '#999',
      textDecorationLine: 'line-through',
      marginRight: 10,
  },
  taxText: {
      fontSize: 12,
      color: '#999',
  },
  divider: {
      height: 1,
      backgroundColor: '#f0f0f0',
      marginVertical: 20,
  },
  quantitySection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#333',
  },
  counter: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f5f5f5',
      borderRadius: 25,
      paddingHorizontal: 5,
      paddingVertical: 5,
  },
  counterBtn: {
      width: 32,
      height: 32,
      backgroundColor: '#fff',
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      elevation: 1,
  },
  quantityValue: {
      fontSize: 16,
      fontWeight: 'bold',
      marginHorizontal: 15,
      minWidth: 20,
      textAlign: 'center',
  },
  descriptionHead: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 24,
  },
  deliveryInfo: {
      marginTop: 20,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f9f9f9',
      padding: 10,
      borderRadius: 8,
  },
  deliveryText: {
      color: '#666',
      fontSize: 13,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  footerBtnContainer: {
      flex: 1,
      paddingHorizontal: 5,
  },
  addToCartBtn: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartText: {
    fontWeight: '700',
    fontSize: 14,
    color: COLORS.primary,
  },
  buyBtn: {
    flex: 1,
    paddingVertical: 13, // border slightly accounts for difference
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyBtnText: {
    fontWeight: '700',
    fontSize: 14,
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reviewCard: {
      backgroundColor: '#f9f9f9',
      padding: 15,
      borderRadius: 12,
      marginBottom: 15,
  },
  reviewHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
  },
  reviewerName: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#333',
  },
  reviewRating: {
      fontSize: 12,
      fontWeight: 'bold',
      color: COLORS.warning,
  },
  reviewComment: {
      fontSize: 13,
      color: '#555',
      lineHeight: 18,
      marginBottom: 10,
  },
  reviewDate: {
      fontSize: 11,
      color: '#999',
  },
  reviewForm: {
      backgroundColor: '#f9f9f9',
      padding: 15,
      borderRadius: 12,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: '#eee',
  },
  reviewFormTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 10,
  },
  starSelector: {
      flexDirection: 'row',
      marginBottom: 15,
      justifyContent: 'center',
  },
  reviewInput: {
      backgroundColor: '#fff',
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      padding: 10,
      height: 80,
      textAlignVertical: 'top',
      marginBottom: 15,
  },
  submitReviewBtn: {
      backgroundColor: COLORS.primary,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
  },
  submitReviewText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 14,
  }
});

export default ProductDetailScreen;
