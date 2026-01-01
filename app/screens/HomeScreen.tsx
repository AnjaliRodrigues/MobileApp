import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../services/apiClient';
import { Product } from '../types';

const HomeScreen = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const navigation = useNavigation<any>();
  const [visibleItems, setVisibleItems] = useState<Record<number, boolean>>({});
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 350);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [searchQuery]);

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
    <TouchableOpacity
      style={styles.item}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('Detail', { product: item })}
    >
      <View style={styles.imageContainer}>
        {visibleItems[item.id] ? (
          <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, { backgroundColor: '#eee' }]} />
        )}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.price}>₹{item.price}</Text>
        <Text style={styles.category}>{item.category}</Text>
      </View>
    </TouchableOpacity>
  );

  const displayedProducts = useMemo(() => {
    if (!debouncedQuery) return products;
    const q = debouncedQuery.toLowerCase();
    return products.filter((p) => p.title?.toLowerCase().includes(q));
  }, [products, debouncedQuery]);

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
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search products..."
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={displayedProducts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={viewabilityConfig.current}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{loading ? 'Loading products...' : 'No results found.'}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
  listContent: { padding: 10 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, marginBottom: 8 },
  searchInput: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, fontSize: 14, color: '#111', elevation: 1 },
  clearButton: { marginLeft: 8 },
  clearText: { color: '#2563eb', fontWeight: '600' },
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
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#6b7280', fontSize: 16 },
  textContainer: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 5 },
  price: { fontSize: 18, fontWeight: 'bold', color: '#007BFF', marginBottom: 5 },
  category: { fontSize: 14, color: '#888', fontStyle: 'italic' },
});

export default HomeScreen;