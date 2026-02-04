import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, SafeAreaView, StatusBar, ActivityIndicator, Image, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { COLORS, THEME } from '../constants/theme';

const CheckoutScreen = () => {
  const navigation = useNavigation<any>();
  const { updateCartCount } = useCart();
  const route = useRoute<any>();
  const { cartItems, totalAmount } = route.params || { cartItems: [], totalAmount: 0 };
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [addNewAddress, setAddNewAddress] = useState(false);
  
  // New address form states
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newAddressLine, setNewAddressLine] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newPostCode, setNewPostCode] = useState('');
  const [newState, setNewState] = useState('');
  const [newCountry, setNewCountry] = useState('India');
  
  // Location Dynamic States
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [selectedState, setSelectedState] = useState<any>(null);
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectionType, setSelectionType] = useState<'country' | 'state' | 'city' | null>(null);

  // Helper Functions for Location
  const fetchCountries = async () => {
    try {
        const response = await api.get('/locations/countries');
        setCountries(response.data.countries || []);
        const india = (response.data.countries || []).find((c: any) => c.name === 'India');
        if (india) {
           // Pre-set India
           setSelectedCountry(india);
           setNewCountry(india.name);
           fetchStates(india.id);
        }
    } catch (error) {
        console.log('Error fetching countries', error);
    }
  };

  const fetchStates = async (countryId: any) => {
      try {
          const response = await api.get(`/locations/states?countryId=${countryId}`);
          setStates(response.data.states || []);
      } catch (error) {
          console.log('Error fetching states', error);
      }
  };

  const fetchCities = async (stateId: any) => {
      try {
          const response = await api.get(`/locations/cities?stateId=${stateId}`);
          setCities(response.data.cities || []);
      } catch (error) {
          console.log('Error fetching cities', error);
      }
  };

  const openModal = (type: 'country' | 'state' | 'city') => {
      if (type === 'state' && !selectedCountry) {
          Alert.alert('Notice', 'Please select a country first');
          return;
      }
      if (type === 'city' && !selectedState) {
          Alert.alert('Notice', 'Please select a state first');
          return;
      }
      setSelectionType(type);
      setModalVisible(true);
  };

  const handleSelectLocation = (item: any, type: string) => {
      if (type === 'country') {
          setSelectedCountry(item);
          setNewCountry(item.name);
          setSelectedState(null);
          setNewState('');
          setSelectedCity(null);
          setNewCity('');
          setStates([]);
          setCities([]);
          fetchStates(item.id);
      } else if (type === 'state') {
          setSelectedState(item);
          setNewState(item.name);
          setSelectedCity(null);
          setNewCity('');
          setCities([]);
          fetchCities(item.id);
      } else if (type === 'city') {
          setSelectedCity(item);
          setNewCity(item.name);
      }
      setModalVisible(false);
      setSelectionType(null);
  };

  const getLocationListData = () => {
      if (selectionType === 'country') return countries;
      if (selectionType === 'state') return states;
      if (selectionType === 'city') return cities;
      return [];
  };

  // Checkout State
  const [address, setAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('online');

  const handlePayment = async () => {
    let finalAddressId = selectedAddressId;

    if (addNewAddress) {
         if (!newFirstName || !newAddressLine || !newCity || !newPostCode || !newState || !newCountry) {
             Alert.alert('Required', 'Please fill all address fields including name');
             return;
         }
         setIsProcessing(true);
         try {
             // Create Address
             const addressPayload = {
                 firstName: newFirstName,
                 lastName: newLastName,
                 addressLine: newAddressLine,
                 city: newCity,
                 postalCode: newPostCode,
                 state: newState,
                 stateName: newState, // Backend expects this key also
                 country: newCountry,
                 countryName: newCountry, // Backend expects this key also
                 addressType: 'Home',
                 isDefault: false
             };
             const addrRes = await api.post('/addresses', addressPayload);
             if (addrRes.data && addrRes.data.address) {
                 finalAddressId = addrRes.data.address.id;
             } else {
                 throw new Error('Failed to save address');
             }
         } catch (err) {
             console.log(err);
             Alert.alert('Error', 'Could not save new address');
             setIsProcessing(false);
             return;
         }
    } else {
        if (!finalAddressId) {
             Alert.alert('Required', 'Please select a delivery address');
             return;
        }
    }

    setIsProcessing(true);
    
    try {
        const orderPayload = {
            shippingAddressId: finalAddressId,
            billingAddressId: finalAddressId,
            items: cartItems.map((item: any) => {
                const unitPrice = item.new_price || item.newPrice || item.price || 0; 
                return { 
                    productId: item.product_id || item.id, 
                    quantity: item.quantity,
                    price: unitPrice,
                    total: unitPrice * item.quantity
                };
            }),
            paymentMethod: paymentMethod === 'online' ? 'razorpay' : 'cod',
            shippingMethod: 'free',
            total: totalAmount 
        };
        
        const response = await api.post('/orders', orderPayload);
        
        setIsProcessing(false);
        if (response.status === 201) {
             // Success
             await updateCartCount(); // Refresh context
             Alert.alert('Success', 'Order placed successfully!', [
                { text: 'OK', onPress: () => navigation.navigate('Orders') }
             ]);
        }
    } catch (error: any) {
        console.error(error);
        setIsProcessing(false);
        const msg = error.response?.data?.message || 'Payment failed';
        Alert.alert('Error', msg);
    }
  };

  const fetchProfile = async () => {
      try {
          const res = await api.get('/auth/me');
          const user = res.data.user || res.data;
          if (user) {
              setNewFirstName(user.first_name || user.firstName || '');
              setNewLastName(user.last_name || user.lastName || '');
          }
      } catch (err) {
         // silent fail
      }
  };

  React.useEffect(() => {
    fetchAddresses();
    fetchCountries();
    fetchProfile();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await api.get('/addresses');
      const list = response.data.addresses || response.data || [];
      setSavedAddresses(list);
      
      // Auto-select default or first
      if (list.length > 0) {
          selectAddress(list[0]);
      } else {
          setAddNewAddress(true);
      }
    } catch (error) {
      console.log('Error fetching addresses', error);
      setAddNewAddress(true); // Fallback to form
    }
  };

  const selectAddress = (item: any) => {
      setSelectedAddressId(item.id);
      setAddNewAddress(false);
      // Format address for the order payload (which currently expects a string)
      // Assuming item has: address_line1 (or address), city, state, postal_code (or zipcode)
      const formatted = `${item.address || item.address_line1}, ${item.city}, ${item.state}, ${item.zip_code || item.postal_code || item.postCode}, ${item.country}`;
      setAddress(formatted);
  };
  
  const handleNewAddressChange = () => {
      // Re-construct the full address string whenever a field changes
      // This is a bit inefficient to run on every render but simple for now. 
      // Better: construct it only on submit.
      // BUT `address` state is used by handlePayment check.
      // So we should update `address` state when these change OR update handlePayment to check these fields if addNewAddress is true.
      // Let's update `address` state:
      const formatted = `${newAddressLine}, ${newCity}, ${newState}, ${newPostCode}, ${newCountry}`;
      setAddress(formatted);
  };

  // Effect to update address string when new address fields change
  React.useEffect(() => {
      if (addNewAddress) {
          const formatted = [newAddressLine, newCity, newPostCode, newState, newCountry].filter(Boolean).join(', ');
          setAddress(formatted);
      }
  }, [newAddressLine, newCity, newPostCode, newState, newCountry, addNewAddress]);

  // Render
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={{flex: 1}}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            
            {/* Address Section */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="location-outline" size={20} color="#333" />
                    <Text style={styles.sectionTitle}>Delivery Address</Text>
                </View>
                
                {savedAddresses.length > 0 && (
                    <View style={styles.addressList}>
                        {savedAddresses.map((item) => (
                            <TouchableOpacity 
                                key={item.id} 
                                style={[styles.addressCard, selectedAddressId === item.id && !addNewAddress && styles.addressCardSelected]}
                                onPress={() => selectAddress(item)}
                            >
                                <View style={styles.radioContainer}>
                                    <View style={[styles.radio, selectedAddressId === item.id && !addNewAddress && styles.radioSelected]} />
                                </View>
                                <View style={styles.addressDetails}>
                                    <Text style={styles.addressName}>{item.type || 'Home'}</Text>
                                    <Text style={styles.addressText}>
                                        {item.address || item.address_line1}, {item.city}
                                    </Text>
                                    <Text style={styles.addressText}>
                                        {item.state} - {item.zip_code || item.postal_code || item.postCode}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Add New Address Toggle */}
                <TouchableOpacity 
                    style={[styles.addNewToggle, addNewAddress && styles.addressCardSelected]}
                    onPress={() => {
                        setAddNewAddress(true);
                        setSelectedAddressId(null);
                        setAddress(''); // Clear previous selection string
                    }}
                >
                    <View style={styles.radioContainer}>
                        <View style={[styles.radio, addNewAddress && styles.radioSelected]} />
                    </View>
                    <Text style={styles.addNewText}>+ Add New Address</Text>
                </TouchableOpacity>

                {/* New Address Form */}
                {addNewAddress && (
                    <View style={styles.newAddressForm}>
                        <View style={styles.row}>
                             <View style={[styles.inputWrapper, { flex: 1, marginRight: 10 }]}>
                                 <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                                 <TextInput 
                                     style={styles.input}
                                     placeholder="First Name"
                                     placeholderTextColor="#999"
                                     value={newFirstName}
                                     onChangeText={setNewFirstName}
                                 />
                             </View>
                             <View style={[styles.inputWrapper, { flex: 1 }]}>
                                 <TextInput 
                                     style={styles.input}
                                     placeholder="Last Name"
                                     placeholderTextColor="#999"
                                     value={newLastName}
                                     onChangeText={setNewLastName}
                                 />
                             </View>
                        </View>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="location-outline" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput 
                                style={styles.input}
                                placeholder="Address Line (House No, Street)"
                                placeholderTextColor="#999"
                                value={newAddressLine}
                                onChangeText={setNewAddressLine}
                            />
                        </View>

                        <View style={styles.row}>
                            <TouchableOpacity 
                                style={[styles.inputWrapper, { flex: 1, marginRight: 10 }]} 
                                onPress={() => openModal('country')}
                            >
                                 <Text style={[styles.inputText, !newCountry && styles.placeholderText]}>{newCountry || "Country"}</Text>
                                 <Ionicons name="chevron-down" size={16} color="#999" />
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[styles.inputWrapper, { flex: 1 }]}
                                onPress={() => openModal('state')}
                            >
                                 <Text style={[styles.inputText, !newState && styles.placeholderText]}>{newState || "State"}</Text>
                                 <Ionicons name="chevron-down" size={16} color="#999" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.row}>
                            <TouchableOpacity 
                                style={[styles.inputWrapper, { flex: 1, marginRight: 10 }]}
                                onPress={() => openModal('city')}
                            >
                                 <Text style={[styles.inputText, !newCity && styles.placeholderText]}>{newCity || "City"}</Text>
                                 <Ionicons name="chevron-down" size={16} color="#999" />
                            </TouchableOpacity>

                            <View style={[styles.inputWrapper, { flex: 1 }]}>
                                 <TextInput 
                                    style={styles.input}
                                    placeholder="Pincode"
                                    placeholderTextColor="#999"
                                    value={newPostCode}
                                    onChangeText={setNewPostCode}
                                    keyboardType="number-pad"
                                 />
                            </View>
                        </View>
                    </View>
                )}
            </View>

            {/* Order Summary */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="receipt-outline" size={20} color="#333" />
                    <Text style={styles.sectionTitle}>Order Summary</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Items Total</Text>
                    <Text style={styles.summaryValue}>₹{totalAmount}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Delivery Fee</Text>
                    <Text style={styles.freeDelivery}>Free</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total to Pay</Text>
                    <Text style={styles.totalValue}>₹{totalAmount}</Text>
                </View>
            </View>

            {/* Payment Method */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="card-outline" size={20} color="#333" />
                    <Text style={styles.sectionTitle}>Payment Method</Text>
                </View>
                
                <TouchableOpacity 
                    style={[styles.paymentOption, paymentMethod === 'online' && styles.paymentOptionSelected]}
                    onPress={() => setPaymentMethod('online')}
                >
                    <View style={[styles.radio, paymentMethod === 'online' && styles.radioSelected]} />
                    <Text style={styles.paymentText}>Credit/Debit Card / UPI</Text>
                    <Image 
                        source={{uri: 'https://cdn-icons-png.flaticon.com/512/196/196578.png'}} 
                        style={{width: 30, height: 30, marginLeft: 'auto', opacity: 0.7}} 
                        resizeMode="contain"
                    />
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.paymentOption, paymentMethod === 'cod' && styles.paymentOptionSelected]}
                    onPress={() => setPaymentMethod('cod')}
                >
                    <View style={[styles.radio, paymentMethod === 'cod' && styles.radioSelected]} />
                    <Text style={styles.paymentText}>Cash on Delivery</Text>
                    <Ionicons name="cash-outline" size={24} color="#666" style={{marginLeft: 'auto'}} />
                </TouchableOpacity>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>

      {/* Pay Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          onPress={handlePayment}
          disabled={isProcessing}
        >
            <LinearGradient
                colors={isProcessing ? ['#ccc', '#bbb'] : THEME.gradients.primary as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.payButton}
            >
                {isProcessing ? (
                     <ActivityIndicator color="#fff" /> 
                ) : (
                    <>
                        <Text style={styles.payButtonText}>PAY ₹{totalAmount}</Text>
                        <Ionicons name="lock-closed" size={18} color="#fff" style={{marginLeft: 8}} />
                    </>
                )}
            </LinearGradient>
        </TouchableOpacity>
      </View>
      <Modal
            visible={modalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Select {selectionType ? selectionType.charAt(0).toUpperCase() + selectionType.slice(1) : ''}</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>
                    
                    {getLocationListData().length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No options available</Text>
                        </View>
                    ) : (
                        <ScrollView style={{maxHeight: 400}}>
                            {getLocationListData().map((item: any) => (
                                <TouchableOpacity 
                                    key={item.id} 
                                    style={styles.modalItem} 
                                    onPress={() => handleSelectLocation(item, selectionType!)}
                                >
                                    <Text style={styles.modalItemText}>{item.name}</Text>
                                    {((selectionType === 'country' && selectedCountry?.id === item.id) ||
                                      (selectionType === 'state' && selectedState?.id === item.id) ||
                                      (selectionType === 'city' && selectedCity?.id === item.id)) && (
                                        <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </View>
            </View>
        </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
      padding: 15,
      paddingBottom: 100,
  },
  section: {
      backgroundColor: '#fff',
      padding: 15,
      borderRadius: 12,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
  },
  sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
      paddingBottom: 10,
  },
  sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 10,
      color: '#333',
  },

  summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
  },
  summaryLabel: {
      color: '#666',
      fontSize: 14,
  },
  summaryValue: {
      color: '#333',
      fontSize: 14,
      fontWeight: '500',
  },
  freeDelivery: {
      color: COLORS.success,
      fontWeight: 'bold',
  },
  divider: {
      height: 1,
      backgroundColor: '#f0f0f0',
      marginVertical: 10,
  },
  totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 5,
  },
  totalLabel: {
      fontWeight: '700',
      fontSize: 16,
      color: '#333',
  },
  totalValue: {
      fontWeight: '700',
      fontSize: 18,
      color: COLORS.primary,
  },
  paymentOption: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 15,
      borderWidth: 1,
      borderColor: '#eee',
      borderRadius: 8,
      marginBottom: 10,
      backgroundColor: '#fff',
  },
  paymentOptionSelected: {
      borderColor: COLORS.primary,
      backgroundColor: '#f0fdf4', // Very light green
  },
  radio: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: '#ccc',
      marginRight: 10,
  },
  radioSelected: {
      borderColor: COLORS.primary,
      borderWidth: 5,
  },
  paymentText: {
      fontWeight: '500',
      color: '#333',
      fontSize: 14,
  },
  footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#fff',
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: '#f0f0f0',
      elevation: 10,
  },
  payButton: {
      paddingVertical: 15,
      borderRadius: 30,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
  },
  payButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: 0.5,
  },
  addressList: {
      marginTop: 5,
  },
  addressCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderWidth: 1,
      borderColor: '#eee',
      borderRadius: 10,
      marginBottom: 10,
      backgroundColor: '#fff',
  },
  addressCardSelected: {
      borderColor: COLORS.primary,
      backgroundColor: '#f0fdf4',
  },
  radioContainer: {
      marginRight: 10,
  },
  addressDetails: {
      flex: 1,
  },
  addressName: {
      fontWeight: '600',
      color: '#333',
      fontSize: 14,
      marginBottom: 2,
  },
  addressText: {
      fontSize: 13,
      color: '#666',
      lineHeight: 18,
  },
  addNewToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderWidth: 1,
      borderColor: '#eee',
      borderRadius: 10,
      borderStyle: 'dashed',
      marginTop: 5,
  },
  addNewText: {
      color: COLORS.primary,
      fontWeight: '600',
      fontSize: 14,
  },
  newAddressForm: {
      marginTop: 15,
      padding: 10,
      backgroundColor: '#fafafa',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#eee',
  },
  row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
  },
  inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f9f9f9',
      borderRadius: 12,
      marginBottom: 15,
      paddingHorizontal: 15,
      height: 55,
      borderWidth: 1,
      borderColor: '#eee',
  },
  inputIcon: {
      marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#333',
    fontSize: 16,
  },
  inputText: {
      fontSize: 16,
      color: '#333',
  },
  placeholderText: {
      color: '#999',
  },
  modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
  },
  modalContainer: {
      width: '85%',
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 20,
      maxHeight: '70%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
  },
  modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
      paddingBottom: 10,
  },
  modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
  },
  closeBtn: {
      padding: 5,
  },
  modalItem: {
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  modalItemText: {
      fontSize: 16,
      color: '#333',
  },
  emptyState: {
      padding: 20,
      alignItems: 'center',
  },
  emptyText: {
      color: '#999',
      fontSize: 16,
  }
});

export default CheckoutScreen;
