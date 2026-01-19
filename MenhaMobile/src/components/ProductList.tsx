import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = width / 2 - 15;

interface ProductListProps {
  data: any[];
  onPress: (item: any) => void;
}

const ProductList: React.FC<ProductListProps> = ({ data, onPress }) => {
  const renderItem = ({ item }: { item: any }) => {
    const imageUrl = item.image || (item.images && item.images[0]?.url) || 'https://via.placeholder.com/300';
    const rating = item.rating || 4.8;
    const reviews = item.reviews || 0;
    
    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => onPress(item)}
        activeOpacity={0.9}
      >
        <View style={styles.imageContainer}>
             {/* Sale Badge */}
            {item.sale && (
                 <View style={styles.badge}>
                     <Text style={styles.badgeText}>{item.sale}</Text>
                 </View>
            )}
            
            {/* Wishlist Icon */}
             <TouchableOpacity style={styles.wishlistIcon}>
                 <Text style={{fontSize: 16}}>♡</Text> 
             </TouchableOpacity>

            <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        </View>

        <View style={styles.details}>
          <Text style={styles.name} numberOfLines={2}>{item.name || item.title}</Text>
          
          <View style={styles.metaRow}>
              {item.category && <Text style={styles.metaBadge}>{item.category}</Text>}
              {item.weight && <Text style={styles.metaBadge}>{item.weight}</Text>}
          </View>
          
          <View style={styles.ratingRow}>
              <Text style={styles.star}>★</Text>
              <Text style={styles.ratingText}>{rating}</Text>
              <Text style={styles.divider}>|</Text>
              <Text style={styles.reviews}>{reviews} Reviews</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{item.newPrice || item.price}</Text>
            {(item.oldPrice && item.oldPrice > 0) && <Text style={styles.oldPrice}>₹{item.oldPrice}</Text>}
          </View>

          <TouchableOpacity style={styles.addButton}>
             {/* Simple Logo Placeholder since we don't have the asset handy in mobile assets folder unless downloaded */}
            <Text style={styles.addButtonIcon}>🛒</Text>
            <Text style={styles.addButtonText}>Add to cart</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => (item.id || Math.random()).toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        scrollEnabled={false} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    marginTop: 10,
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    width: COLUMN_WIDTH,
    backgroundColor: '#fff',
    marginBottom: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  imageContainer: {
    height: COLUMN_WIDTH,
    width: '100%',
    position: 'relative',
    backgroundColor: '#f9f9f9',
    overflow: 'hidden',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#E53935',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 1,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  wishlistIcon: {
      position: 'absolute',
      top: 10,
      right: 10,
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: 'rgba(255,255,255,0.9)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      elevation: 1,
  },
  details: {
    padding: 10,
  },
  name: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginBottom: 5,
    height: 38,
  },
  metaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 5,
  },
  metaBadge: {
      fontSize: 10,
      color: '#666',
      backgroundColor: '#f5f5f5',
      paddingHorizontal: 5,
      paddingVertical: 2,
      borderRadius: 2,
      marginRight: 5,
      marginBottom: 2,
  },
  ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
  },
  star: {
      color: '#FFD700', // Gold
      fontSize: 12,
      marginRight: 2,
  },
  ratingText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#333',
  },
  divider: {
      marginHorizontal: 5,
      color: '#ccc',
      fontSize: 10,
  },
  reviews: {
      fontSize: 11,
      color: '#888',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 5,
  },
  oldPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 4,
    paddingVertical: 8,
  },
  addButtonIcon: {
      marginRight: 5,
      fontSize: 12,
  },
  addButtonText: {
    color: '#333',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default ProductList;
