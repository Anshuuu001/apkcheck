export class CardRegistry {
  private static cards: Record<string, string> = {

    SimpleCard: `
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface SimpleCardProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  style?: ViewStyle;
}

export const SimpleCard: React.FC<SimpleCardProps> = ({ title, subtitle, children, style }) => (
  <View style={[styles.card, style]}>
    <Text style={styles.title}>{title}</Text>
    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 12,
  },
  title: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#64748b' },
});
`,

    ProfileCard: `
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';

interface ProfileCardProps {
  name: string;
  role: string;
  avatar?: string;
  email?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ name, role, avatar, email, onPress, style }) => (
  <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.9}>
    <Image
      source={avatar ? { uri: avatar } : require('../assets/default_avatar.png')}
      style={styles.avatar}
    />
    <View style={styles.info}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.role}>{role}</Text>
      {email && <Text style={styles.email}>{email}</Text>}
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff', borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3, marginBottom: 12,
  },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#e2e8f0' },
  info: { marginLeft: 14, flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  role: { fontSize: 13, color: '#3b82f6', fontWeight: '600', marginTop: 2 },
  email: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
});
`,

    StatsCard: `
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface StatsCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: React.ReactNode;
  color?: string;
  style?: ViewStyle;
}

export const StatsCard: React.FC<StatsCardProps> = ({ label, value, change, changeType = 'neutral', icon, color = '#3b82f6', style }) => (
  <View style={[styles.card, style]}>
    <View style={styles.header}>
      <Text style={styles.label}>{label}</Text>
      {icon && <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>{icon}</View>}
    </View>
    <Text style={[styles.value, { color }]}>{value}</Text>
    {change && (
      <Text style={[styles.change, changeType === 'increase' ? styles.up : changeType === 'decrease' ? styles.down : styles.neutral]}>
        {changeType === 'increase' ? '↑ ' : changeType === 'decrease' ? '↓ ' : ''}{change}
      </Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff', borderRadius: 16, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3, flex: 1, minWidth: 140,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 13, color: '#64748b', fontWeight: '500' },
  value: { fontSize: 28, fontWeight: '800', marginBottom: 4 },
  change: { fontSize: 12, fontWeight: '600' },
  up: { color: '#10b981' },
  down: { color: '#ef4444' },
  neutral: { color: '#94a3b8' },
});
`,

    ProductCard: `
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';

interface ProductCardProps {
  name: string;
  price: number;
  image?: string;
  rating?: number;
  onPress?: () => void;
  onAddToCart?: () => void;
  style?: ViewStyle;
}

export const ProductCard: React.FC<ProductCardProps> = ({ name, price, image, rating, onPress, onAddToCart, style }) => (
  <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.9}>
    <Image source={image ? { uri: image } : require('../assets/placeholder.png')} style={styles.image} />
    <View style={styles.body}>
      <Text style={styles.name} numberOfLines={2}>{name}</Text>
      {rating !== undefined && <Text style={styles.rating}>⭐ {rating.toFixed(1)}</Text>}
      <View style={styles.footer}>
        <Text style={styles.price}>₹{price.toLocaleString()}</Text>
        {onAddToCart && (
          <TouchableOpacity style={styles.addBtn} onPress={onAddToCart}>
            <Text style={styles.addText}>+ Add</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff', borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3, width: 170, margin: 8,
  },
  image: { width: '100%', height: 140, backgroundColor: '#f1f5f9' },
  body: { padding: 12 },
  name: { fontSize: 14, fontWeight: '600', color: '#1e293b', marginBottom: 4 },
  rating: { fontSize: 12, color: '#f59e0b', marginBottom: 6 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 16, fontWeight: '800', color: '#3b82f6' },
  addBtn: { backgroundColor: '#3b82f6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  addText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
`,

    OrderCard: `
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface OrderCardProps {
  orderId: string;
  date: string;
  status: OrderStatus;
  total: number;
  itemCount: number;
  onPress?: () => void;
  style?: ViewStyle;
}

const statusColors: Record<OrderStatus, string> = {
  pending: '#f59e0b',
  processing: '#3b82f6',
  shipped: '#8b5cf6',
  delivered: '#10b981',
  cancelled: '#ef4444',
};

export const OrderCard: React.FC<OrderCardProps> = ({ orderId, date, status, total, itemCount, onPress, style }) => (
  <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.9}>
    <View style={styles.header}>
      <Text style={styles.orderId}>#{orderId}</Text>
      <View style={[styles.badge, { backgroundColor: statusColors[status] + '20' }]}>
        <Text style={[styles.badgeText, { color: statusColors[status] }]}>{status.toUpperCase()}</Text>
      </View>
    </View>
    <View style={styles.row}>
      <Text style={styles.meta}>{date} · {itemCount} items</Text>
      <Text style={styles.total}>₹{total.toLocaleString()}</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff', borderRadius: 14, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2, marginBottom: 10,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderId: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  meta: { fontSize: 13, color: '#94a3b8' },
  total: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
});
`,

    AppointmentCard: `
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';

type ApptStatus = 'scheduled' | 'completed' | 'cancelled' | 'no-show';

interface AppointmentCardProps {
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: ApptStatus;
  onPress?: () => void;
  style?: ViewStyle;
}

const statusMap: Record<ApptStatus, { color: string; label: string }> = {
  scheduled: { color: '#3b82f6', label: 'Scheduled' },
  completed: { color: '#10b981', label: 'Completed' },
  cancelled: { color: '#ef4444', label: 'Cancelled' },
  'no-show': { color: '#f59e0b', label: 'No Show' },
};

export const AppointmentCard: React.FC<AppointmentCardProps> = ({ doctorName, specialty, date, time, status, onPress, style }) => {
  const s = statusMap[status];
  return (
    <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.left}>
        <View style={[styles.avatar, { backgroundColor: s.color + '20' }]}>
          <Text style={[styles.avatarText, { color: s.color }]}>{doctorName[0]}</Text>
        </View>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{doctorName}</Text>
        <Text style={styles.specialty}>{specialty}</Text>
        <Text style={styles.time}>📅 {date}  🕐 {time}</Text>
      </View>
      <View style={[styles.badge, { backgroundColor: s.color + '15' }]}>
        <Text style={[styles.badgeText, { color: s.color }]}>{s.label}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff', borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2, marginBottom: 10,
  },
  left: { marginRight: 12 },
  avatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '800' },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  specialty: { fontSize: 13, color: '#64748b', marginTop: 2 },
  time: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '700' },
});
`,
  };

  static get(componentName: string): string {
    return this.cards[componentName] ?? this.cards['SimpleCard'];
  }

  static getAll(): Record<string, string> {
    return { ...this.cards };
  }

  static list(): string[] {
    return Object.keys(this.cards);
  }
}
