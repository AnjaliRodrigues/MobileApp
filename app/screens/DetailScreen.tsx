import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { Product } from '../types';

type ParamList = {
  Detail: { product: Product };
};

export default function DetailScreen() {
  const route = useRoute<RouteProp<ParamList, 'Detail'>>();
  const product = route.params?.product;
  const navigation = useNavigation<any>();

  if (!product) {
    return (
      <View style={styles.center}>
        <Text>Product not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Product Details</Text>
        <Text onPress={() => navigation.goBack()} style={styles.close}>Back</Text>
      </View>
      <View style={styles.imageWrap}>
        <Image source={{ uri: product.image }} style={styles.image} resizeMode="contain" />
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>{product.title}</Text>
        <Text style={styles.price}>₹{product.price}</Text>
        <Text style={styles.category}>{product.category}</Text>
        <Text style={styles.description}>{product.description}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>ID: {product.id}</Text>
          <Text style={styles.meta}>Rating: {product.rating?.rate ?? 'N/A'} ({product.rating?.count ?? 0})</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f2f4f8' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0f1724' },
  close: { color: '#0b74ff', fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imageWrap: { alignItems: 'center', marginBottom: 16, backgroundColor: '#fff', padding: 16, borderRadius: 12, elevation: 2 },
  image: { width: 260, height: 260 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 2 },
  title: { fontSize: 20, fontWeight: '700', color: '#0f1724', marginBottom: 8 },
  price: { fontSize: 18, fontWeight: '700', color: '#0b74ff', marginBottom: 8 },
  category: { fontSize: 14, color: '#64748b', marginBottom: 12, fontStyle: 'italic' },
  description: { fontSize: 14, color: '#22313f', lineHeight: 20, marginBottom: 12 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  meta: { fontSize: 13, color: '#475569' },
});
 
