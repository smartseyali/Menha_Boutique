import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import api from '../services/api';

const OrdersScreen = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
        const response = await api.get('/orders/my-orders');
        setOrders(response.data.orders || response.data || []);
    } catch (error) {
       // console.error(error); // silent fail for now
    } finally {
       setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.header}>
          <Text style={styles.orderId}>Order #{item.id || item.order_number}</Text>
          <Text style={styles.status}>{item.status}</Text>
      </View>
      <Text style={styles.date}>{new Date(item.created_at || Date.now()).toLocaleDateString()}</Text>
      <View style={styles.footer}>
          <Text style={styles.totalLabel}>Total Amount:</Text>
          <Text style={styles.totalPrice}>₹{item.total_amount || item.total}</Text>
      </View>
    </View>
  );

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#E53935"/></View>;

  if (orders.length === 0) {
      return (
          <View style={styles.center}>
              <Text style={styles.emptyText}>No orders found</Text>
          </View>
      );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        renderItem={renderItem}
        contentContainerStyle={{padding: 15}}
        keyExtractor={(item) => (item.id || Math.random()).toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  center: {flex:1, justifyContent:'center', alignItems:'center'},
  emptyText: { fontSize:16, color:'#888'},
  card: {
      backgroundColor: '#fff',
      padding: 15,
      borderRadius: 10,
      marginBottom: 15,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width:0, height:1},
      shadowOpacity: 0.1,
      shadowRadius: 2,
  },
  header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
  },
  orderId: {
      fontWeight: 'bold',
      fontSize: 16,
  },
  status: {
      color: '#007AFF', // or dynamic color based on status
      fontWeight: '600',
  },
  date: {
      color: '#666',
      marginBottom: 10,
  },
  footer: {
      borderTopWidth: 1,
      borderColor: '#eee',
      paddingTop: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  totalLabel: {
      fontSize: 14,
      color: '#333',
  },
  totalPrice: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#E53935',
  },
});

export default OrdersScreen;
