import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useAuth } from '../../services/AuthContext';
import { supabase } from '../../services/supabase';
import { useState } from 'react';
import { ActivityIndicator, Alert } from 'react-native';

type Props = NativeStackScreenProps<RootStackParamList, 'FarePreview'>;

export default function FarePreviewScreen({ navigation, route }: Props) {
  const { startLocation, destination, date, time, seats, genderPref } = route.params;
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);

  const handlePublishRide = async () => {
    if (!session?.user?.id) {
      Alert.alert('Error', 'User not logged in!');
      return;
    }
    setLoading(true);

    const { error } = await supabase.from('rides').insert({
      driver_id: session.user.id,
      origin: startLocation,
      destination: destination,
      available_seats: seats,
      price_per_seat: 31,
      departure_time: new Date().toISOString(),
      vehicle: 'Honda Activa', // Default/placeholder for now
      status: 'waiting'
    });

    setLoading(false);

    if (error) {
      Alert.alert('Failed to publish', error.message);
    } else {
      navigation.replace('RideRequests');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Fare Preview</Text>
        </View>

        {/* Route Summary Card */}
        <View style={styles.routeCard}>
          <Text style={styles.sectionLabel}>ROUTE SUMMARY</Text>

          {/* From */}
          <View style={styles.routeRow}>
            <View style={styles.pinDot} />
            <View style={styles.routeTextGroup}>
              <Text style={styles.routeMeta}>FROM</Text>
              <Text style={styles.routeName}>{startLocation}</Text>
            </View>
          </View>

          <View style={styles.dashedLine} />

          {/* To */}
          <View style={styles.routeRow}>
            <View style={styles.pinSquare} />
            <View style={styles.routeTextGroup}>
              <Text style={styles.routeMeta}>TO</Text>
              <Text style={styles.routeName}>{destination}</Text>
            </View>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Ionicons
              name="navigate-outline"
              size={20}
              color={theme.colors.onSurfaceVariant}
              style={{ marginBottom: 6 }}
            />
            <Text style={styles.statValue}>3.2 km</Text>
            <Text style={styles.statLabel}>Distance</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statBox}>
            <Ionicons
              name="time-outline"
              size={20}
              color={theme.colors.onSurfaceVariant}
              style={{ marginBottom: 6 }}
            />
            <Text style={styles.statValue}>~12 min</Text>
            <Text style={styles.statLabel}>Est. Time</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statBox}>
            <Ionicons
              name="person-outline"
              size={20}
              color={theme.colors.onSurfaceVariant}
              style={{ marginBottom: 6 }}
            />
            <Text style={styles.statValue}>{seats} seat{seats > 1 ? 's' : ''}</Text>
            <Text style={styles.statLabel}>Capacity</Text>
          </View>
        </View>

        {/* Fare Breakdown */}
        <View style={styles.fareCard}>
          <Text style={styles.sectionLabel}>FARE BREAKDOWN</Text>

          <View style={styles.fareRow}>
            <Text style={styles.fareItem}>Base fare</Text>
            <Text style={styles.fareAmount}>₹15.00</Text>
          </View>
          <View style={styles.fareRow}>
            <Text style={styles.fareItem}>Distance (3.2 km × ₹5)</Text>
            <Text style={styles.fareAmount}>₹16.00</Text>
          </View>

          {/* Divider via background shift — no 1px border rule */}
          <View style={styles.fareDivider} />

          <View style={styles.fareRow}>
            <Text style={styles.fareTotalLabel}>Suggested Fare</Text>
            <Text style={styles.fareTotalAmount}>₹31.00</Text>
          </View>
        </View>

        <View style={styles.noteBox}>
          <Ionicons
            name="information-circle-outline"
            size={16}
            color={theme.colors.onSurfaceVariant}
            style={{ marginRight: 6 }}
          />
          <Text style={styles.noteText}>
            Fares are suggested based on distance. Students share cost — not profit.
          </Text>
        </View>

        {/* Publish Button */}
        <TouchableOpacity
          style={[styles.primaryButton, loading && { opacity: 0.7 }]}
          onPress={handlePublishRide}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.onPrimary} />
          ) : (
            <>
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color={theme.colors.onPrimary}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.buttonText}>Publish Ride</Text>
            </>
          )}
        </TouchableOpacity>

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

  routeCard: {
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
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  pinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: theme.colors.primary,
    marginRight: theme.spacing.m,
  },
  pinSquare: {
    width: 14,
    height: 14,
    borderRadius: 3,
    backgroundColor: theme.colors.black,
    marginRight: theme.spacing.m,
  },
  routeTextGroup: { flex: 1 },
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
  dashedLine: {
    width: 2,
    height: 24,
    backgroundColor: theme.colors.surfaceContainerHighest,
    marginLeft: 6,
    marginVertical: 4,
  },

  /* Stats */
  statsRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.card,
    paddingVertical: theme.spacing.m,
    marginBottom: theme.spacing.m,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.surfaceContainerHighest,
  },
  statValue: {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.title.fontSize,
    fontWeight: '800',
    color: theme.colors.black,
    marginBottom: 2,
  },
  statLabel: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },

  /* Fare */
  fareCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.s,
  },
  fareItem: {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.onSurfaceVariant,
  },
  fareAmount: {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '700',
    color: theme.colors.black,
  },
  fareDivider: {
    height: 8,
    backgroundColor: theme.colors.surfaceContainerLow,
    marginHorizontal: -theme.spacing.m,
    marginBottom: theme.spacing.s,
  },
  fareTotalLabel: {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.title.fontSize,
    fontWeight: '700',
    color: theme.colors.black,
  },
  fareTotalAmount: {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.title.fontSize,
    fontWeight: '800',
    color: theme.colors.black,
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
