import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { supabase } from '../../services/supabase';
import { useState, useEffect } from 'react';
import MapSelectionView from '../../components/maps/MapSelectionView';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'RideList'>;
  route: RouteProp<RootStackParamList, 'RideList'>;
};

// Replace MOCK_RIDES with local state
const getInitials = (name: string) => {
  if (!name) return 'CR';
  const parts = name.split(' ');
  if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

function StarRow({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Ionicons
          key={i}
          name={i < full ? 'star' : half && i === full ? 'star-half' : 'star-outline'}
          size={11}
          color={theme.colors.primary}
        />
      ))}
      <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
    </View>
  );
}

export default function RideListScreen({ navigation, route }: Props) {
  const { pickup, destination } = route.params;
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  useEffect(() => {
    const searchRides = async () => {
      setLoading(true);
      let query = supabase
        .from('rides')
        .select(`
          *,
          profiles(full_name, rating, avatar_url)
        `)
        .eq('status', 'waiting');

      if (pickup) {
        query = query.ilike('origin', `%${pickup}%`);
      }
      if (destination) {
        query = query.ilike('destination', `%${destination}%`);
      }

      const { data, error } = await query;
      if (!error && data) {
        setRides(data);
      }
      setLoading(false);
    };

    searchRides();
  }, [pickup, destination]);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.rideCard}>

      {/* Top: Avatar + rider info + fare */}
      <View style={styles.cardTop}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(item.profiles?.full_name)}</Text>
        </View>
        <View style={styles.riderInfo}>
          <Text style={styles.riderName}>{item.profiles?.full_name || 'Driver'}</Text>
          <StarRow rating={item.profiles?.rating || 4.8} />
        </View>
        <View style={styles.fareBox}>
          <Text style={styles.fareAmount}>₹{item.price_per_seat}</Text>
          <Text style={styles.fareLabel}>per seat</Text>
        </View>
      </View>

      {/* Divider via background shift */}
      <View style={styles.metaDivider} />

      {/* Meta row */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="bicycle-outline" size={15} color={theme.colors.onSurfaceVariant} />
          <Text style={styles.metaText}>{item.vehicle}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={15} color={theme.colors.onSurfaceVariant} />
          <Text style={styles.metaText}>
            {new Date(item.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="person-outline" size={15} color={theme.colors.onSurfaceVariant} />
          <Text style={styles.metaText}>{item.available_seats} seat{item.available_seats > 1 ? 's' : ''}</Text>
        </View>
      </View>

      {/* Vehicle info placeholder */}
      <View style={styles.vehicleNumRow}>
        <View style={styles.vehicleNumBadge}>
          <Text style={styles.vehicleNumText}>CR VERIFIED VEHICLE</Text>
        </View>
      </View>

      {/* View details */}
      <TouchableOpacity
        style={styles.detailsButton}
        onPress={() => navigation.navigate('RideDetail', { ride: item })}
      >
        <Text style={styles.detailsButtonText}>View Details</Text>
        <Ionicons name="arrow-forward" size={16} color={theme.colors.onPrimary} />
      </TouchableOpacity>

    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.black} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Available Rides</Text>
            <Text style={styles.headerSub}>
              {pickup || 'Anywhere'} → {destination || 'Anywhere'}
            </Text>
          </View>
          <View style={{ flex: 1 }} />
          <View style={styles.toggleContainer}>
            <TouchableOpacity 
              style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnActive]} 
              onPress={() => setViewMode('list')}
            >
              <Ionicons name="list" size={18} color={viewMode === 'list' ? theme.colors.white : theme.colors.onSurfaceVariant} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleBtn, viewMode === 'map' && styles.toggleBtnActive]} 
              onPress={() => setViewMode('map')}
            >
              <Ionicons name="map-outline" size={18} color={viewMode === 'map' ? theme.colors.white : theme.colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <Text style={{ textAlign: 'center', marginTop: 24, fontFamily: theme.typography.fontFamily }}>Searching...</Text>
        ) : rides.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 24, color: theme.colors.onSurfaceVariant }}>No rides match your route. Try a different search.</Text>
        ) : viewMode === 'list' ? (
          <FlatList
            data={rides}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ gap: theme.spacing.m }}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <MapSelectionView 
            rides={rides} 
            onSelectRide={(ride) => navigation.navigate('RideDetail', { ride })} 
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.surfaceContainerLow },
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.l,
    paddingTop: theme.spacing.m,
    paddingBottom: 20,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.m,
  },
  headerTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.title.fontSize,
    fontWeight: theme.typography.title.fontWeight as any,
    color: theme.colors.black,
  },
  headerSub: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceContainerLow,
    borderRadius: 12,
    padding: 2,
    borderWidth: 1,
    borderColor: theme.colors.surfaceContainerHigh,
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  toggleBtnActive: {
    backgroundColor: theme.colors.black,
  },

  rideCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.m,
  },

  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.m,
  },
  avatarText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.black,
  },
  riderInfo: { flex: 1 },
  riderName: {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '700',
    color: theme.colors.black,
    marginBottom: 4,
  },
  ratingText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginLeft: 4,
  },
  fareBox: { alignItems: 'flex-end' },
  fareAmount: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.black,
  },
  fareLabel: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
  },

  metaDivider: {
    height: 1,
    backgroundColor: theme.colors.surfaceContainerLow,
    marginBottom: theme.spacing.m,
  },

  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.m,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },

  vehicleNumRow: {
    marginBottom: theme.spacing.m,
  },
  vehicleNumBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.surfaceContainerHighest,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  vehicleNumText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.black,
    letterSpacing: 1,
  },

  detailsButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.black,
    borderRadius: theme.borderRadius.button,
    paddingVertical: 13,
    gap: 8,
  },
  detailsButtonText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.label.fontSize,
    fontWeight: theme.typography.label.fontWeight as any,
    color: theme.colors.white,
  },
});
