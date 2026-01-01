import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../services/apiClient';
import { Product } from '../types';

const HomeScreen = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const [visibleItems, setVisibleItems] = useState<Record<number, boolean>>({});
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 });
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: Array<{ item: any }> }) => {
    const map: Record<number, boolean> = {};
    viewableItems.forEach((v) => {
      if (v?.item?.id != null) map[v.item.id] = true;
    });
    setVisibleItems((prev) => ({ ...prev, ...map }));
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.item}>
      <View style={styles.imageContainer}>
        {visibleItems[item.id] ? (
          <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, { backgroundColor: '#eee' }]} />
        )}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.price}>${item.price}</Text>
        <Text style={styles.category}>{item.category}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={viewabilityConfig.current}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
  listContent: { padding: 10 },
  item: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: { width: 80, height: 80, borderRadius: 8, marginRight: 15, overflow: 'hidden' },
  image: { width: 80, height: 80 },
  textContainer: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 5 },
  price: { fontSize: 18, fontWeight: 'bold', color: '#007BFF', marginBottom: 5 },
  category: { fontSize: 14, color: '#888', fontStyle: 'italic' },
});

export default HomeScreen;