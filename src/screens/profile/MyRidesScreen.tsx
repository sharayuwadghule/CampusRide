import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';

import { useAuth } from '../../services/AuthContext';
import { supabase } from '../../services/supabase';
import { Alert, ActivityIndicator } from 'react-native';

type Tab = 'passenger' | 'rider';

function StarRow({ count }: { count: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Ionicons
          key={s}
          name={s <= count ? 'star' : 'star-outline'}
          size={12}
          color={theme.colors.primary}
        />
      ))}
    </View>
  );
}

function EmptyState({ tab }: { tab: Tab }) {
  return (
    <View style={styles.emptyState}>
      <Ionicons
        name={tab === 'passenger' ? 'bicycle-outline' : 'car-outline'}
        size={48}
        color={theme.colors.surfaceContainerHighest}
        style={{ marginBottom: theme.spacing.m }}
      />
      <Text style={styles.emptyTitle}>No rides yet</Text>
      <Text style={styles.emptySubtitle}>
        {tab === 'passenger'
          ? 'Your ride history as a passenger will appear here'
          : 'Rides you offered will appear here'}
      </Text>
    </View>
  );
}

export default function MyRidesScreen() {
  const navigation = useNavigation();
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('passenger');
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchMyRides = async () => {
      if (!session?.user?.id) return;
      setLoading(true);

      try {
        if (activeTab === 'passenger') {
          // Fetch rides where user is a passenger and request was accepted
          const { data, error } = await supabase
            .from('ride_requests')
            .select('*, rides(*, profiles(full_name))')
            .eq('passenger_id', session.user.id)
            .eq('status', 'accepted')
            .order('created_at', { ascending: false });

          if (data) {
            setRides(data.map(req => ({
              id: req.id,
              date: new Date(req.rides.departure_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
              from: req.rides.origin,
              to: req.rides.destination,
              fare: req.rides.price_per_seat,
              rating: 5,
              name: req.rides.profiles.full_name,
            })));
          }
        } else {
          // Fetch rides where user is the driver
          const { data, error } = await supabase
            .from('rides')
            .select('*, ride_requests(count)')
            .eq('driver_id', session.user.id)
            .order('created_at', { ascending: false });

          if (data) {
            setRides(data.map(ride => ({
              id: ride.id,
              date: new Date(ride.departure_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
              from: ride.origin,
              to: ride.destination,
              fare: ride.price_per_seat,
              rating: 5,
              name: `${ride.ride_requests?.[0]?.count || 0} passengers`,
            })));
          }
        }
      } catch (err) {
        console.error('Error fetching my rides:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyRides();
  }, [session, activeTab]);

  const renderRide = ({ item }: { item: any }) => (
    <View style={styles.rideCard}>
      <View style={styles.rideCardTop}>
        <View style={styles.routeLines}>
          <View style={styles.pinDot} />
          <View style={styles.routeConnector} />
          <View style={styles.pinSquare} />
        </View>
        <View style={styles.rideRouteGroup}>
          <Text style={styles.routeText}>{item.from}</Text>
          <View style={styles.routeSpacer} />
          <Text style={styles.routeText}>{item.to}</Text>
        </View>
        <View style={styles.fareBox}>
          <Text style={styles.fareAmount}>₹{item.fare}</Text>
        </View>
      </View>
      <View style={styles.rideCardBottom}>
        <View style={styles.metaGroup}>
          <Ionicons name="time-outline" size={13} color={theme.colors.onSurfaceVariant} />
          <Text style={styles.metaText}>{item.date}</Text>
        </View>
        <View style={styles.metaGroup}>
          <Ionicons name={activeTab === 'passenger' ? "person-outline" : "people-outline"} size={13} color={theme.colors.onSurfaceVariant} />
          <Text style={styles.metaText}>{item.name}</Text>
        </View>
        <StarRow count={item.rating} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Rides</Text>
          <View style={styles.headerStats}>
            <Ionicons name="bicycle-outline" size={14} color={theme.colors.onSurfaceVariant} />
            <Text style={styles.headerStatText}>{rides.length} rides</Text>
          </View>
        </View>

        {/* Tab switcher */}
        <View style={styles.tabBar}>
          {(['passenger', 'rider'] as Tab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'passenger' ? 'As Passenger' : 'As Rider'}
              </Text>
              {/* Count badge removed for simplicity or updated */}
            </TouchableOpacity>
          ))}
        </View>

        {/* List */}
        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={rides}
            keyExtractor={(item) => item.id}
            renderItem={renderRide}
            contentContainerStyle={{ gap: theme.spacing.m, paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<EmptyState tab={activeTab} />}
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
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: theme.colors.surfaceContainerHighest,
    borderRadius: theme.borderRadius.button,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 'auto',
  },
  headerStatText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.onSurfaceVariant,
  },

  /* Tabs */
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.button,
    padding: 4,
    marginBottom: theme.spacing.l,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 40,
    gap: 6,
  },
  tabActive: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.onSurfaceVariant,
  },
  tabTextActive: {
    color: theme.colors.black,
  },
  countBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.colors.surfaceContainerHighest,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countBadgeActive: { backgroundColor: 'rgba(0,0,0,0.12)' },
  countText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.onSurfaceVariant,
  },
  countTextActive: { color: theme.colors.black },

  /* Ride Card */
  rideCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.m,
  },
  rideCardTop: {
    flexDirection: 'row',
    marginBottom: theme.spacing.m,
  },
  routeLines: {
    alignItems: 'center',
    marginRight: theme.spacing.m,
    paddingTop: 3,
  },
  pinDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  routeConnector: {
    width: 2,
    flex: 1,
    backgroundColor: theme.colors.surfaceContainerHighest,
    marginVertical: 3,
    minHeight: 20,
  },
  pinSquare: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: theme.colors.black,
  },
  rideRouteGroup: {
    flex: 1,
    justifyContent: 'space-between',
  },
  routeText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '700',
    color: theme.colors.black,
  },
  routeSpacer: { height: 20 },
  fareBox: { justifyContent: 'center' },
  fareAmount: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.black,
  },
  rideCardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing.m,
    backgroundColor: theme.colors.surfaceContainerLow,
    borderRadius: 10,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: 10,
  },
  metaGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },

  /* Empty */
  emptyState: {
    alignItems: 'center',
    paddingTop: theme.spacing.xxl,
  },
  emptyTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.title.fontSize,
    fontWeight: theme.typography.title.fontWeight as any,
    color: theme.colors.black,
    marginBottom: theme.spacing.s,
  },
  emptySubtitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: theme.spacing.xl,
  },
});
