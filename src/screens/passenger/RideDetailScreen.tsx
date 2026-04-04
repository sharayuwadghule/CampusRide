import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { RouteProp } from '@react-navigation/native';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../services/AuthContext';
import { useState } from 'react';
import { ActivityIndicator, Alert } from 'react-native';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'RideDetail'>;
  route: RouteProp<RootStackParamList, 'RideDetail'>;
};

function StarRow({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Ionicons
          key={i}
          name={i < full ? 'star' : half && i === full ? 'star-half' : 'star-outline'}
          size={14}
          color={theme.colors.primary}
        />
      ))}
      <Text style={styles.ratingText}>4.9</Text>
    </View>
  );
}


const getInitials = (name: string) => {
  if (!name) return 'CR';
  const parts = name.split(' ');
  if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

export default function RideDetailScreen({ navigation, route }: Props) {
  const { session } = useAuth();
  const { ride } = route.params;
  const [loading, setLoading] = useState(false);

  const handleBookRide = async () => {
    if (!session?.user?.id) return;
    setLoading(true);

    const { error } = await supabase.from('bookings').insert({
      ride_id: ride.id,
      passenger_id: session.user.id,
      seats_booked: 1,
    });

    setLoading(false);

    if (error) {
      Alert.alert('Booking Failed', error.message);
    } else {
      navigation.navigate('RequestSent');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ride Details</Text>
        </View>

        {/* Rider Profile Card */}
        <View style={styles.riderCard}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(ride.profiles?.full_name)}</Text>
            </View>
            {/* Verification badge */}
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark" size={10} color={theme.colors.black} />
            </View>
          </View>
          <View style={styles.riderInfo}>
            <Text style={styles.riderName}>{ride.profiles?.full_name || 'Driver'}</Text>
            <StarRow rating={ride.profiles?.rating || 4.8} />
            <Text style={styles.riderMeta}>42 rides · ID Verified</Text>
          </View>
        </View>

        {/* Route Card */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>ROUTE</Text>
          <View style={styles.routeRow}>
            <View style={styles.pinDot} />
            <View>
              <Text style={styles.routeMeta}>FROM</Text>
              <Text style={styles.routeName}>{ride.origin}</Text>
            </View>
          </View>
          <View style={styles.routeConnector} />
          <View style={styles.routeRow}>
            <View style={styles.pinSquare} />
            <View>
              <Text style={styles.routeMeta}>TO</Text>
              <Text style={styles.routeName}>{ride.destination}</Text>
            </View>
          </View>
        </View>

        {/* Ride Info Grid */}
        <View style={styles.infoGrid}>
          <View style={styles.infoBox}>
            <Ionicons name="calendar-outline" size={20} color={theme.colors.onSurfaceVariant} style={{ marginBottom: 6 }} />
            <Text style={styles.infoValue}>
              {new Date(ride.departure_time).toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </Text>
            <Text style={styles.infoLabel}>Date</Text>
          </View>
          <View style={styles.infoBox}>
            <Ionicons name="time-outline" size={20} color={theme.colors.onSurfaceVariant} style={{ marginBottom: 6 }} />
            <Text style={styles.infoValue}>
              {new Date(ride.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <Text style={styles.infoLabel}>Departure</Text>
          </View>
          <View style={styles.infoBox}>
            <Ionicons name="person-outline" size={20} color={theme.colors.onSurfaceVariant} style={{ marginBottom: 6 }} />
            <Text style={styles.infoValue}>{ride.available_seats} seat{ride.available_seats !== 1 ? 's' : ''}</Text>
            <Text style={styles.infoLabel}>Available</Text>
          </View>
          <View style={styles.infoBox}>
            <Ionicons name="cash-outline" size={20} color={theme.colors.onSurfaceVariant} style={{ marginBottom: 6 }} />
            <Text style={styles.infoValue}>₹{ride.price_per_seat}</Text>
            <Text style={styles.infoLabel}>Fare</Text>
          </View>
        </View>

        {/* Vehicle Card */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>VEHICLE</Text>
          <View style={styles.vehicleRow}>
            <View style={styles.vehicleIconBox}>
              <Ionicons name="bicycle-outline" size={28} color={theme.colors.black} />
            </View>
            <View>
              <Text style={styles.vehicleName}>Honda Activa</Text>
              <View style={styles.vehicleNumBadge}>
                <Text style={styles.vehicleNumText}>MH 12 AB 3456</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Gender preference note */}
        <View style={styles.noteBox}>
          <Ionicons name="information-circle-outline" size={16} color={theme.colors.onSurfaceVariant} style={{ marginRight: 8 }} />
          <Text style={styles.noteText}>
            This rider has no gender preference — open to all students.
          </Text>
        </View>

        {/* Send Request */}
        <TouchableOpacity
          style={[styles.primaryButton, loading && { opacity: 0.7 }]}
          onPress={handleBookRide}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.onPrimary} />
          ) : (
            <>
              <Ionicons name="send-outline" size={18} color={theme.colors.onPrimary} style={{ marginRight: 8 }} />
              <Text style={styles.buttonText}>Send Ride Request</Text>
            </>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.surfaceContainerLow },
  scrollContent: {
    paddingHorizontal: theme.spacing.l,
    paddingTop: theme.spacing.m,
    paddingBottom: 40,
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

  /* Rider Card */
  riderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
  },
  avatarWrapper: { position: 'relative', marginRight: theme.spacing.m },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.black,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.background,
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
  riderMeta: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginTop: 4,
  },

  /* Generic Card */
  card: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
  },
  sectionLabel: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: theme.colors.onSurfaceVariant,
    marginBottom: theme.spacing.m,
  },

  /* Route */
  routeRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  pinDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: theme.colors.primary, marginRight: theme.spacing.m },
  pinSquare: { width: 12, height: 12, borderRadius: 3, backgroundColor: theme.colors.black, marginRight: theme.spacing.m },
  routeConnector: {
    width: 2,
    height: 22,
    backgroundColor: theme.colors.surfaceContainerHighest,
    marginLeft: 5,
    marginVertical: 2,
  },
  routeMeta: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 2,
  },
  routeName: {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '700',
    color: theme.colors.black,
  },

  /* Info Grid */
  infoGrid: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.card,
    paddingVertical: theme.spacing.m,
    marginBottom: theme.spacing.m,
  },
  infoBox: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  infoValue: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.black,
    marginBottom: 2,
    textAlign: 'center',
  },
  infoLabel: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
  },

  /* Vehicle */
  vehicleRow: { flexDirection: 'row', alignItems: 'center' },
  vehicleIconBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.m,
  },
  vehicleName: {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '700',
    color: theme.colors.black,
    marginBottom: 6,
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

  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.surfaceContainerHighest,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.xl,
  },
  noteText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily,
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
    lineHeight: 18,
  },

  primaryButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.button,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.onSurface,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
  },
  buttonText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.label.fontSize,
    fontWeight: theme.typography.label.fontWeight as any,
    color: theme.colors.onPrimary,
  },
});
