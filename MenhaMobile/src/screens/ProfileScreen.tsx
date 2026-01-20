import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Switch, StatusBar, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {/* Header Profile Section */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
           <Ionicons name="person" size={40} color="#999" />
          {/* <Image source={{ uri: 'https://via.placeholder.com/100' }} style={styles.avatar} /> */}
        </View>
        <Text style={styles.name}>Guest User</Text>
        <Text style={styles.email}>guest@example.com</Text>
        
        <TouchableOpacity style={styles.editButton}>
            <LinearGradient
                colors={['#f59e0b', '#f97316']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.editBtnGradient}
            >
                <Text style={styles.editButtonText}>Edit Profile</Text>
            </LinearGradient>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
        {menuItems.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.menuItem} 
            onPress={() => item.screen && navigation.navigate(item.screen)}
          >
            <View style={styles.iconBox}>
                <Ionicons name={item.icon as any} size={22} color="#1a472a" />
            </View>
            <Text style={styles.menuTitle}>{item.title}</Text>
            <Ionicons name="chevron-forward" size={18} color="#ccc" />
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <View style={[styles.iconBox, styles.logoutIconBox]}>
                <Ionicons name="log-out-outline" size={22} color="#d32f2f" />
            </View>
            <Text style={[styles.menuTitle, styles.logoutText]}>Log Out</Text>
        </TouchableOpacity>
        
        <View style={styles.versionContainer}>
            <Text style={styles.versionText}>App Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#f5f5f5',
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 5,
  },
  email: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
  },
  editButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  editBtnGradient: {
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  menuContainer: {
    flex: 1,
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 25,
    backgroundColor: '#fff',
    marginBottom: 1,
  },
  iconBox: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: '#e6f4ea',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 20,
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 25,
    marginTop: 20,
  },
  logoutIconBox: {
      backgroundColor: '#ffebee',
  },
  logoutText: {
    color: '#d32f2f',
    fontWeight: '600',
  },
  versionContainer: {
      padding: 30,
      alignItems: 'center',
  },
  versionText: {
      color: '#ccc',
      fontSize: 12,
  }
});

export default ProfileScreen;
