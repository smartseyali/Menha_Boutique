import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, SafeAreaView, StatusBar } from 'react-native';
import api from '../services/api';
import { Ionicons } from '@expo/vector-icons';

const OrdersScreen = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
        const response = await api.get('/orders');
        setOrders(response.data.orders || response.data || []);
    } catch (error) {
       // console.error(error); // silent fail for now
    } finally {
       setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
      switch(status?.toLowerCase()) {
          case 'delivered': return '#1e8e3e';
          case 'cancelled': return '#E53935';
          case 'processing': return '#f59e0b';
          default: return '#007AFF';
      }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.header}>
          <View style={styles.orderIdContainer}>
              <Ionicons name="cube-outline" size={18} color="#333" />
              <Text style={styles.orderId}>Order #{item.id || item.order_number}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.status, { color: getStatusColor(item.status) }]}>{item.status}</Text>
          </View>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.detailsRow}>
          <View>
              <Text style={styles.label}>Date</Text>
              <Text style={styles.value}>{new Date(item.created_at || Date.now()).toLocaleDateString()}</Text>
          </View>
          <View style={{alignItems: 'flex-end'}}>
              <Text style={styles.label}>Total Amount</Text>
              <Text style={styles.totalPrice}>₹{item.total_amount || item.total}</Text>
          </View>
      </View>
    </View>
  );

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#f97316"/></View>;

  if (orders.length === 0) {
      return (
          <View style={styles.center}>
              <Ionicons name="receipt-outline" size={60} color="#ccc" style={{marginBottom: 10}} />
              <Text style={styles.emptyText}>No orders found</Text>
          </View>
      );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <FlatList
        data={orders}
        renderItem={renderItem}
        contentContainerStyle={{padding: 15}}
        keyExtractor={(item) => (item.id || Math.random()).toString()}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  center: {flex:1, justifyContent:'center', alignItems:'center'},
  emptyText: { fontSize:16, color:'#888', fontWeight: '500'},
  card: {
      backgroundColor: '#fff',
      borderRadius: 12,
      marginBottom: 15,
      padding: 15,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width:0, height: 1},
      shadowOpacity: 0.05,
      shadowRadius: 3,
      borderWidth: 1,
      borderColor: '#f0f0f0',
  },
  header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  orderIdContainer: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  orderId: {
      fontWeight: '700',
      fontSize: 16,
      marginLeft: 8,
      color: '#333',
  },
  statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
  },
  status: {
      fontWeight: '600',
      fontSize: 12,
      textTransform: 'capitalize',
  },
  divider: {
      height: 1,
      backgroundColor: '#f0f0f0',
      marginVertical: 12,
  },
  detailsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
  },
  label: {
      fontSize: 12,
      color: '#888',
      marginBottom: 4,
  },
  value: {
      fontSize: 14,
      color: '#333',
      fontWeight: '500',
  },
  totalPrice: {
      fontSize: 18,
      fontWeight: '700',
      color: '#1a472a', // Brand deep green
  },
});

export default OrdersScreen;
