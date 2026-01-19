import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen = () => {
  const navigation = useNavigation<any>();

  const handleLogout = async () => {
    await AsyncStorage.removeItem('auth_token');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const menuItems = [
    { title: 'My Orders', icon: 'cube-outline', screen: 'Orders' },
    { title: 'My Wishlist', icon: 'heart-outline', screen: 'Wishlist' },
    { title: 'Shipping Addresses', icon: 'location-outline', screen: 'Address' },
    { title: 'Payment Methods', icon: 'card-outline', screen: '' },
    { title: 'My Reviews', icon: 'star-outline', screen: '' },
    { title: 'Settings', icon: 'settings-outline', screen: '' },
  ];

  return (
    <View style={styles.container}>
      {/* Header Profile Section */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
           <Ionicons name="person" size={40} color="#ccc" />
          {/* <Image source={{ uri: 'https://via.placeholder.com/100' }} style={styles.avatar} /> */}
        </View>
        <Text style={styles.name}>Guest User</Text>
        <Text style={styles.email}>guest@example.com</Text>
        <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.menuItem} 
            onPress={() => item.screen && navigation.navigate(item.screen)}
          >
            <View style={styles.iconBox}>
                <Ionicons name={item.icon as any} size={22} color="#555" />
            </View>
            <Text style={styles.menuTitle}>{item.title}</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={[styles.menuItem, styles.logoutButton]} onPress={handleLogout}>
            <View style={[styles.iconBox, {backgroundColor: '#ffebee'}]}>
                <Ionicons name="log-out-outline" size={22} color="#E53935" />
            </View>
            <Text style={[styles.menuTitle, styles.logoutText]}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  editButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 20,
  },
  editButtonText: {
    color: '#333',
    fontSize: 12,
    fontWeight: '600',
  },
  menuContainer: {
    marginTop: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  iconBox: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#f5f5f5',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 15,
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    marginTop: 20,
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#E53935',
    fontWeight: '600',
  },
});

export default ProfileScreen;
