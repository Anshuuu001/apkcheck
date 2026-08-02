/**
 * ListRegistry — Pre-built list components for common data types.
 * Includes FlatList-based implementations with pull-to-refresh,
 * empty states, loading skeletons, and pagination support.
 */
export class ListRegistry {
  private static lists: Record<string, string> = {

    UserList: `
import React from 'react';
import { FlatList, View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';

interface User {
  id: string | number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  status?: 'active' | 'inactive';
}

interface UserListProps {
  users: User[];
  loading?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
  onUserPress?: (user: User) => void;
  onEndReached?: () => void;
}

export const UserList: React.FC<UserListProps> = ({ users, loading, onRefresh, refreshing = false, onUserPress, onEndReached }) => {
  if (loading && users.length === 0) {
    return <ActivityIndicator style={styles.loader} size="large" color="#3b82f6" />;
  }

  return (
    <FlatList
      data={users}
      keyExtractor={item => String(item.id)}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.item} onPress={() => onUserPress?.(item)} activeOpacity={0.8}>
          <Image source={item.avatar ? { uri: item.avatar } : require('../assets/default_avatar.png')} style={styles.avatar} />
          <View style={styles.info}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.email}>{item.email}</Text>
            <Text style={styles.role}>{item.role}</Text>
          </View>
          <View style={[styles.dot, { backgroundColor: item.status === 'active' ? '#10b981' : '#e2e8f0' }]} />
        </TouchableOpacity>
      )}
      onRefresh={onRefresh}
      refreshing={refreshing}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.3}
      ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>No users found</Text></View>}
      contentContainerStyle={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  loader: { flex: 1, marginTop: 48 },
  list: { paddingHorizontal: 16, paddingVertical: 8 },
  item: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14, flexDirection: 'row',
    alignItems: 'center', marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#e2e8f0' },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  email: { fontSize: 13, color: '#64748b', marginTop: 2 },
  role: { fontSize: 12, color: '#3b82f6', fontWeight: '600', marginTop: 2 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  empty: { flex: 1, alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 15, color: '#94a3b8' },
});
`,

    AppointmentList: `
import React from 'react';
import { FlatList, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { AppointmentCard } from '../components/AppointmentCard';

interface Appointment {
  id: string | number;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
}

interface AppointmentListProps {
  appointments: Appointment[];
  loading?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
  onPress?: (appt: Appointment) => void;
}

export const AppointmentList: React.FC<AppointmentListProps> = ({ appointments, loading, onRefresh, refreshing = false, onPress }) => {
  if (loading && appointments.length === 0) {
    return <ActivityIndicator style={{ marginTop: 48 }} size="large" color="#3b82f6" />;
  }

  return (
    <FlatList
      data={appointments}
      keyExtractor={item => String(item.id)}
      renderItem={({ item }) => (
        <AppointmentCard
          doctorName={item.doctorName}
          specialty={item.specialty}
          date={item.date}
          time={item.time}
          status={item.status}
          onPress={() => onPress?.(item)}
          style={{ marginHorizontal: 16 }}
        />
      )}
      onRefresh={onRefresh}
      refreshing={refreshing}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📅</Text>
          <Text style={styles.emptyTitle}>No Appointments</Text>
          <Text style={styles.emptySubtitle}>Your upcoming appointments will appear here</Text>
        </View>
      }
      contentContainerStyle={{ paddingVertical: 8, flexGrow: 1 }}
    />
  );
};

const styles = StyleSheet.create({
  empty: { flex: 1, alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: '#94a3b8', textAlign: 'center', maxWidth: 240 },
});
`,

    ProductList: `
import React from 'react';
import { FlatList, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { ProductCard } from '../components/ProductCard';

interface Product {
  id: string | number;
  name: string;
  price: number;
  image?: string;
  rating?: number;
}

interface ProductListProps {
  products: Product[];
  loading?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
  onProductPress?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  numColumns?: number;
}

export const ProductList: React.FC<ProductListProps> = ({ products, loading, onRefresh, refreshing = false, onProductPress, onAddToCart, numColumns = 2 }) => {
  if (loading && products.length === 0) {
    return <ActivityIndicator style={{ marginTop: 48 }} size="large" color="#3b82f6" />;
  }

  return (
    <FlatList
      data={products}
      keyExtractor={item => String(item.id)}
      numColumns={numColumns}
      renderItem={({ item }) => (
        <ProductCard
          name={item.name}
          price={item.price}
          image={item.image}
          rating={item.rating}
          onPress={() => onProductPress?.(item)}
          onAddToCart={() => onAddToCart?.(item)}
        />
      )}
      onRefresh={onRefresh}
      refreshing={refreshing}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyTitle}>No Products Found</Text>
        </View>
      }
      contentContainerStyle={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: { padding: 8, flexGrow: 1 },
  empty: { flex: 1, alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
});
`,
  };

  static get(listName: string): string {
    return this.lists[listName] ?? this.lists['UserList'];
  }

  static getAll(): Record<string, string> {
    return { ...this.lists };
  }

  static list(): string[] {
    return Object.keys(this.lists);
  }
}
