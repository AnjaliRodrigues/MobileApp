import React, { useState, useEffect, useRef, useMemo, useContext } from 'react';
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
import FilterContext from '../context/FilterContext';
import { SortKey } from '../types/filters';

const HomeScreen = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const { searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, sortOption, setSortOption } = useContext(FilterContext);
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [showCategoryOptions, setShowCategoryOptions] = useState(false);
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
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const resp = await apiClient.get('/products/categories');
      const list = Array.isArray(resp.data) ? resp.data : [];
      setCategories(['All', ...list]);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

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
    let result = products.slice();
    if (selectedCategory && selectedCategory !== 'All') {
      result = result.filter((p) => p.category === selectedCategory);
    }
    if (debouncedQuery) {
      const q = debouncedQuery.toLowerCase();
      result = result.filter((p) => p.title?.toLowerCase().includes(q));
    }
    // apply sorting
    if (sortOption === 'price_asc') result.sort((a, b) => a.price - b.price);
    else if (sortOption === 'price_desc') result.sort((a, b) => b.price - a.price);
    else if (sortOption === 'name_asc') result.sort((a, b) => a.title.localeCompare(b.title));
    else if (sortOption === 'name_desc') result.sort((a, b) => b.title.localeCompare(a.title));

    return result;
  }, [products, debouncedQuery, selectedCategory, sortOption]);

  function labelForSort(key: SortKey) {
    switch (key) {
      case 'price_asc':
        return 'Price ↑';
      case 'price_desc':
        return 'Price ↓';
      case 'name_asc':
        return 'Name A-Z';
      case 'name_desc':
        return 'Name Z-A';
      default:
        return 'None';
    }
  }

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
      <View style={styles.controlsRow}>
        <TouchableOpacity style={styles.control} onPress={() => { setShowSortOptions((s) => !s); setShowCategoryOptions(false); }}>
          <Text style={styles.controlText}>{sortOption ? `Sort: ${labelForSort(sortOption)}` : 'Sort'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.control} onPress={() => { setShowCategoryOptions((s) => !s); setShowSortOptions(false); }}>
          <Text style={styles.controlText}>{selectedCategory ?? 'Category'}</Text>
        </TouchableOpacity>
      </View>
      {showSortOptions && (
        <View style={styles.optionsPanel}>
          {[
            { key: '' as SortKey, label: 'None' },
            { key: 'price_asc' as SortKey, label: 'Price: Low → High' },
            { key: 'price_desc' as SortKey, label: 'Price: High → Low' },
            { key: 'name_asc' as SortKey, label: 'Name: A → Z' },
            { key: 'name_desc' as SortKey, label: 'Name: Z → A' },
          ].map((o) => (
            <TouchableOpacity key={String(o.key) || 'none'} style={styles.optionItem} onPress={() => { setSortOption(o.key as SortKey); setShowSortOptions(false); }}>
              <Text style={styles.optionText}>{o.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {showCategoryOptions && (
        <View style={styles.optionsPanel}>
          {categories.map((c) => (
            <TouchableOpacity key={c} style={styles.optionItem} onPress={() => { setSelectedCategory(c); setShowCategoryOptions(false); }}>
              <Text style={styles.optionText}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
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
  controlsRow: { flexDirection: 'row', paddingHorizontal: 10, marginBottom: 8 },
  control: { backgroundColor: '#fff', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, marginRight: 8, elevation: 1 },
  controlText: { color: '#111', fontWeight: '600' },
  optionsPanel: { backgroundColor: '#fff', marginHorizontal: 10, borderRadius: 8, elevation: 2, paddingVertical: 6, marginBottom: 8 },
  optionItem: { paddingVertical: 10, paddingHorizontal: 12 },
  optionText: { color: '#0f1724' },
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