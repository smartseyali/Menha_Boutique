import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const Header = () => {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      {/* Top Row: Brand & Icons */}
      <View style={styles.topRow}>
        <Text style={styles.brand}>Menha Boutique</Text>
        <View style={styles.iconsRow}>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Wishlist')}>
               <Ionicons name="heart-outline" size={24} color="#333" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Cart')}>
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>0</Text>
              </View>
              <Ionicons name="cart-outline" size={24} color="#333" />
            </TouchableOpacity>
        </View>
      </View>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput 
          style={styles.input} 
          placeholder="Search for products..." 
          placeholderTextColor="#888"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brand: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E53935',
  },
  iconButton: {
    padding: 5,
    marginLeft: 10,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'red',
    borderRadius: 8,
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
  },
  input: {
    flex: 1,
    height: '100%',
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
  searchIcon: {
    marginRight: 0,
  }
});

export default Header;
