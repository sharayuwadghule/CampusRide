import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useAuth } from '../../services/AuthContext';
import { supabase } from '../../services/supabase';
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<NavProp>();
  const { session } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [rides, setRides] = useState<any[]>([]);

  const [stats, setStats] = useState({ totalRides: 0, rating: 4.8, saved: 0 });

  useEffect(() => {
    const fetchHomeData = async () => {
      if (!session?.user?.id) return;
      
      try {
        // Fetch Profile
        const { data: prof } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', session.user.id)
          .single();
        if (prof) setProfile(prof);

        // Fetch ride counts
        const { count: riderCount } = await supabase
          .from('rides')
          .select('*', { count: 'exact', head: true })
          .eq('driver_id', session.user.id);

        const { count: requestCount } = await supabase
          .from('ride_requests')
          .select('*', { count: 'exact', head: true })
          .eq('passenger_id', session.user.id)
          .eq('status', 'accepted');

        const total = (riderCount || 0) + (requestCount || 0);
        setStats(prev => ({
          ...prev,
          totalRides: total,
          saved: (requestCount || 0) * 25,
        }));

        // Fetch active rides (global feed)
        const { data: recentRides } = await supabase
          .from('rides')
          .select('*, profiles(full_name)')
          .limit(5)
          .order('created_at', { ascending: false });
          
        if (recentRides) setRides(recentRides);
      } catch (err) {
        console.error('Error fetching home data:', err);
      }
    };

    fetchHomeData();
  }, [session]);

  const handleLeaveNow = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required for "Leave Now"');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      // For MVP, we'll suggest a common destination since we don't know where they are going
      // or just jump to OfferRide with "Current Location" filled in.
      navigation.navigate('OfferRide', { 
        prefillStart: 'Current Location',
        prefillLat: location.coords.latitude,
        prefillLng: location.coords.longitude 
      });
    } catch (error) {
      console.error(error);
      navigation.navigate('OfferRide');
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'CR';
    const parts = name.split(' ');
    if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Header */}
        <View style={styles.topBar}>
          <View style={styles.logoChip}>
            <View style={styles.logoDot} />
            <Text style={styles.logoText}>CampusRide</Text>
          </View>
          <TouchableOpacity style={styles.notifButton}>
            <Ionicons name="notifications-outline" size={22} color={theme.colors.black} />
            <View style={styles.notifBadge} />
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <View style={styles.greetSection}>
          <View style={styles.greetRow}>
            <Text style={styles.greetHeadline}>
              Hey {profile?.full_name ? profile.full_name.split(' ')[0] : 'Campus Rider'}
            </Text>
            <Text style={styles.waveEmoji}>👋</Text>
          </View>
          <Text style={styles.greetSub}>Where are you heading today?</Text>
        </View>

        {/* Action Cards */}
        <View style={styles.actionCards}>
          {/* Leave Now - Quick Ride */}
          <TouchableOpacity
            style={styles.quickLeaveCard}
            onPress={handleLeaveNow}
            activeOpacity={0.88}
          >
            <View style={styles.quickIconBox}>
              <Ionicons name="flash-outline" size={28} color={theme.colors.white} />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.quickTitle}>Leave Now</Text>
              <Text style={styles.quickSub}>Instantly share your current route</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.white} />
          </TouchableOpacity>

          {/* Find a Ride */}
          <TouchableOpacity
            style={styles.findCard}
            onPress={() => navigation.navigate('FindRide')}
            activeOpacity={0.88}
          >
            <View style={styles.cardIconBox}>
              <Ionicons name="search-outline" size={28} color={theme.colors.black} />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Find a Ride</Text>
              <Text style={styles.cardSub}>Browse available rides near you</Text>
            </View>
            <Ionicons name="arrow-forward-circle" size={28} color={theme.colors.black} />
          </TouchableOpacity>

          {/* Offer a Ride */}
          <TouchableOpacity
            style={styles.offerCard}
            onPress={() => navigation.navigate('OfferRide')}
            activeOpacity={0.88}
          >
            <View style={styles.offerIconBox}>
              <Ionicons name="car-outline" size={28} color={theme.colors.white} />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.offerTitle}>Offer a Ride</Text>
              <Text style={styles.offerSub}>Share your route, earn on the go</Text>
            </View>
            <Ionicons name="arrow-forward-circle" size={28} color={theme.colors.white} />
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalRides}</Text>
            <Text style={styles.statLabel}>Total Rides</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.rating} ⭐</Text>
            <Text style={styles.statLabel}>Your Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>₹{stats.saved}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>
        </View>

        {/* Recent Rides */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Rides</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MyRidesTab' as any)}>
            <Text style={styles.sectionLink}>See All</Text>
          </TouchableOpacity>
        </View>

        {rides.map((ride) => (
          <TouchableOpacity key={ride.id} style={styles.rideCard} activeOpacity={0.85}>
            <View style={styles.rideAvatar}>
              <Text style={styles.rideAvatarText}>
                {getInitials(ride.profiles?.full_name || 'Driver')}
              </Text>
            </View>
            <View style={styles.rideInfo}>
              <Text style={styles.rideName}>{ride.profiles?.full_name || 'Driver'}</Text>
              <Text style={styles.rideRoute} numberOfLines={1}>
                {ride.origin} → {ride.destination}
              </Text>
              <View style={styles.rideMetaRow}>
                <Ionicons name="time-outline" size={12} color={theme.colors.onSurfaceVariant} />
                <Text style={styles.rideMeta}>
                  {new Date(ride.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
            <View style={styles.rideRight}>
              <Text style={styles.rideFare}>₹{ride.price_per_seat}</Text>
              <View style={styles.rideRatingRow}>
                <Ionicons name="star" size={12} color={theme.colors.primary} />
                <Text style={styles.rideRating}>4.8</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {rides.length === 0 && (
          <View style={{ alignItems: 'center', paddingVertical: 24 }}>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>No recent rides found.</Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: {
    paddingHorizontal: theme.spacing.l,
    paddingTop: theme.spacing.m,
    paddingBottom: 100,
  },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  logoText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.black,
    letterSpacing: -0.3,
  },
  notifButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.error,
    borderWidth: 1.5,
    borderColor: theme.colors.background,
  },

  greetSection: { marginBottom: theme.spacing.xl },
  greetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  greetHeadline: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 40,
    fontWeight: '800',
    color: theme.colors.black,
    letterSpacing: -1.5,
  },
  waveEmoji: { fontSize: 32 },
  greetSub: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 16,
    color: theme.colors.onSurfaceVariant,
    lineHeight: 24,
  },

  actionCards: {
    gap: theme.spacing.m,
    marginBottom: theme.spacing.l,
  },
  quickLeaveCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.black,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.l,
    gap: theme.spacing.m,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 6,
  },
  quickIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.white,
    marginBottom: 3,
  },
  quickSub: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  findCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.l,
    gap: theme.spacing.m,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 4,
  },
  offerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.l,
    gap: theme.spacing.m,
    shadowColor: theme.colors.secondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 4,
  },
  cardIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  offerIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: { flex: 1 },
  cardTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.black,
    marginBottom: 3,
  },
  cardSub: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 13,
    color: 'rgba(0,0,0,0.6)',
  },
  offerTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.white,
    marginBottom: 3,
  },
  offerSub: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },

  statsCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceContainerLow,
    borderRadius: theme.borderRadius.card,
    paddingVertical: theme.spacing.l,
    marginBottom: theme.spacing.xl,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.surfaceContainerHigh,
  },
  statValue: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.black,
    marginBottom: 3,
  },
  statLabel: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.black,
    letterSpacing: -0.3,
  },
  sectionLink: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
  },

  rideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
    gap: theme.spacing.m,
    shadowColor: theme.colors.onSurface,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  rideAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surfaceContainerHigh,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rideAvatarText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.black,
  },
  rideInfo: { flex: 1 },
  rideName: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.black,
    marginBottom: 2,
  },
  rideRoute: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 4,
  },
  rideMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rideMeta: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  rideRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  rideFare: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.black,
  },
  rideRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  rideRating: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.onSurfaceVariant,
  },
});
