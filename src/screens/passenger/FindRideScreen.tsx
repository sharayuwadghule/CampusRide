import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'FindRide'>;
};

const POPULAR_ROUTES = [
  { from: 'Main Gate', to: 'Library' },
  { from: 'Hostel Block A', to: 'Canteen' },
  { from: 'Admin Office', to: 'Labs Complex' },
];

export default function FindRideScreen({ navigation }: Props) {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [pickupFocused, setPickupFocused] = useState(false);
  const [destFocused, setDestFocused] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surfaceContainerLow} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={theme.colors.black} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Find a Ride</Text>
          </View>

          {/* Title */}
          <View style={styles.titleBlock}>
            <Text style={styles.pageTitle}>Where are you{'\n'}headed?</Text>
          </View>

          {/* Route Input Card */}
          <View style={styles.routeCard}>
            <View style={[styles.inputRow, pickupFocused && styles.inputRowFocused]}>
              <View style={styles.pinDot} />
              <TextInput
                style={styles.input}
                placeholder="Pickup location"
                placeholderTextColor={theme.colors.onSurfaceVariant}
                value={pickup}
                onChangeText={setPickup}
                onFocus={() => setPickupFocused(true)}
                onBlur={() => setPickupFocused(false)}
              />
              {pickup.length > 0 && (
                <TouchableOpacity onPress={() => setPickup('')}>
                  <Ionicons name="close-circle" size={18} color={theme.colors.onSurfaceVariant} />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.connector}>
              <View style={styles.connectorLine} />
            </View>

            <View style={[styles.inputRow, destFocused && styles.inputRowFocused]}>
              <View style={styles.pinSquare} />
              <TextInput
                style={styles.input}
                placeholder="Destination"
                placeholderTextColor={theme.colors.onSurfaceVariant}
                value={destination}
                onChangeText={setDestination}
                onFocus={() => setDestFocused(true)}
                onBlur={() => setDestFocused(false)}
              />
              {destination.length > 0 && (
                <TouchableOpacity onPress={() => setDestination('')}>
                  <Ionicons name="close-circle" size={18} color={theme.colors.onSurfaceVariant} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Popular Routes */}
          <Text style={styles.sectionLabel}>POPULAR ROUTES</Text>
          <View style={styles.popularRoutes}>
            {POPULAR_ROUTES.map((r, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.routeItem}
                onPress={() => {
                  setPickup(r.from);
                  setDestination(r.to);
                }}
                activeOpacity={0.8}
              >
                <View style={styles.routeItemIcon}>
                  <Ionicons name="navigate-outline" size={16} color={theme.colors.onSurfaceVariant} />
                </View>
                <View style={styles.routeItemTextGroup}>
                  <Text style={styles.routeItemText}>{r.from} → {r.to}</Text>
                </View>
                <Ionicons name="arrow-forward" size={16} color={theme.colors.onSurfaceVariant} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Tips */}
          <View style={styles.tipCard}>
            <Ionicons name="bulb-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.tipText}>
              Rides are matched with verified students making similar routes. Typically 2–5 min wait.
            </Text>
          </View>

          {/* Search Button */}
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => navigation.navigate('RideList', { pickup, destination })}
            activeOpacity={0.88}
          >
            <Ionicons name="search-outline" size={20} color={theme.colors.onPrimary} />
            <Text style={styles.searchButtonText}>Search Available Rides</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.surfaceContainerLow },
  scrollContent: {
    paddingHorizontal: theme.spacing.l,
    paddingTop: theme.spacing.m,
    paddingBottom: 48,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.m,
    marginBottom: theme.spacing.xl,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.onSurfaceVariant,
  },

  titleBlock: { marginBottom: theme.spacing.xl },
  pageTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 36,
    fontWeight: '800',
    color: theme.colors.black,
    letterSpacing: -1,
    lineHeight: 42,
  },

  routeCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.xl,
    shadowColor: theme.colors.onSurface,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceContainerHighest,
    borderRadius: 12,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: 14,
    gap: theme.spacing.m,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  inputRowFocused: {
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.primary,
  },
  pinDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
  },
  pinSquare: {
    width: 12,
    height: 12,
    borderRadius: 3,
    backgroundColor: theme.colors.black,
  },
  input: {
    flex: 1,
    fontFamily: theme.typography.fontFamily,
    fontSize: 15,
    color: theme.colors.black,
  },
  connector: {
    paddingLeft: 17 + theme.spacing.m,
    paddingVertical: 4,
  },
  connectorLine: {
    width: 2,
    height: 16,
    backgroundColor: theme.colors.surfaceContainerHigh,
  },

  sectionLabel: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: theme.colors.onSurfaceVariant,
    marginBottom: theme.spacing.m,
  },

  popularRoutes: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.card,
    marginBottom: theme.spacing.m,
    overflow: 'hidden',
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.m,
    gap: theme.spacing.m,
    // Dividers removed as per Anti-Divider Policy
  },
  routeItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.colors.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeItemTextGroup: { flex: 1 },
  routeItemText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.black,
  },

  tipCard: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'rgba(255, 214, 0, 0.1)',
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.xl,
    alignItems: 'flex-start',
  },
  tipText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily,
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
    lineHeight: 19,
  },

  searchButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.button,
    height: 58,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 4,
  },
  searchButtonText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.black,
  },
});
