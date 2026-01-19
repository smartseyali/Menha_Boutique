import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '../services/api';

const CheckoutScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { cartItems, totalAmount } = route.params || { cartItems: [], totalAmount: 0 };
  const [address, setAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    if (!address) {
        Alert.alert('Required', 'Please enter delivery address');
        return;
    }
    setIsProcessing(true);
    
    try {
        // 1. Create Order on Backend
        const orderPayload = {
            items: cartItems.map((item: any) => ({ product_id: item.product_id || item.id, quantity: item.quantity })),
            total: totalAmount,
            address: address,
            payment_method: 'online' // or 'cod'
        };
        
        // Mock API call
        // const response = await api.post('/orders', orderPayload);
        
        // 2. Mock Payment Gateway Interaction (Razorpay/Stripe)
        setTimeout(() => {
            setIsProcessing(false);
            Alert.alert('Success', 'Order placed successfully!', [
                { text: 'OK', onPress: () => navigation.navigate('Orders') }
            ]);
        }, 2000);

    } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Payment failed');
        setIsProcessing(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <TextInput 
             style={styles.input}
             multiline
             placeholder="Enter full address..."
             value={address}
             onChangeText={setAddress}
          />
      </View>

      <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.row}>
              <Text>Items Total</Text>
              <Text>₹{totalAmount}</Text>
          </View>
          <View style={styles.row}>
              <Text>Delivery Fee</Text>
              <Text style={{color:'green'}}>Free</Text>
          </View>
          <View style={[styles.row, styles.totalRow]}>
              <Text style={styles.totalText}>Total to Pay</Text>
              <Text style={styles.totalText}>₹{totalAmount}</Text>
          </View>
      </View>

      <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <TouchableOpacity style={styles.paymentOption}>
              <View style={styles.radioSelected} />
              <Text style={styles.paymentText}>Credit/Debit Card / UPI (Razorpay)</Text>
          </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.payButton, isProcessing && styles.disabledBtn]} 
        onPress={handlePayment}
        disabled={isProcessing}
      >
          <Text style={styles.payButtonText}>{isProcessing ? 'Processing...' : `PAY ₹${totalAmount}`}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  section: {
      backgroundColor: '#fff',
      padding: 15,
      borderRadius: 10,
      marginBottom: 20,
  },
  sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 10,
      color: '#333',
  },
  input: {
      borderWidth: 1,
      borderColor: '#eee',
      borderRadius: 8,
      padding: 10,
      height: 80,
      textAlignVertical: 'top',
  },
  row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
  },
  totalRow: {
      borderTopWidth: 1,
      borderColor: '#eee',
      paddingTop: 10,
      marginTop: 5,
  },
  totalText: {
      fontWeight: 'bold',
      fontSize: 18,
  },
  paymentOption: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      borderWidth: 1,
      borderColor: '#007AFF',
      borderRadius: 8,
      backgroundColor: '#f0f9ff',
  },
  radioSelected: {
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: '#007AFF',
      marginRight: 10,
  },
  paymentText: {
      fontWeight: '600',
      color: '#333',
  },
  payButton: {
      backgroundColor: '#E53935',
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
      marginBottom: 30,
  },
  disabledBtn: {
      backgroundColor: '#ffaaaa',
  },
  payButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
  }
});

export default CheckoutScreen;
