import { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from '../common/MapView';
import { theme } from '../../theme/theme';
import { Ionicons } from '@expo/vector-icons';

interface RideMarker {
  id: string;
  driver_name: string;
  lat: number;
  lng: number;
  fare: number;
}

interface Props {
  rides: any[];
  onSelectRide: (ride: any) => void;
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
}

export default function MapSelectionView({ rides, onSelectRide, initialRegion }: Props) {
  const [mapRides, setMapRides] = useState<RideMarker[]>([]);

  useEffect(() => {
    // Map the Supabase data to our marker format
    // In a real app, we'd use actual coordinates from the DB.
    // For now, if coordinates are missing, we'll randomize them slightly around a campus center
    // to demonstrate the UI.
    const centerLat = initialRegion?.latitude || 18.5204; // Pune center as fallback
    const centerLng = initialRegion?.longitude || 73.8567;

    const formatted = rides.map((r, idx) => ({
      id: r.id,
      driver_name: r.profiles?.full_name || 'Driver',
      fare: r.price_per_seat || 30,
      lat: r.origin_lat || centerLat + (Math.random() - 0.5) * 0.01,
      lng: r.origin_lng || centerLng + (Math.random() - 0.5) * 0.01,
    }));
    setMapRides(formatted);
  }, [rides]);

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion || {
          latitude: 18.5204,
          longitude: 73.8567,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        {mapRides.map((ride) => (
          <Marker
            key={ride.id}
            coordinate={{ latitude: ride.lat, longitude: ride.lng }}
            pinColor={theme.colors.primary}
          >
            <Callout tooltip onPress={() => onSelectRide(rides.find(r => r.id === ride.id))}>
              <View style={styles.calloutContainer}>
                <Text style={styles.riderName}>{ride.driver_name}</Text>
                <View style={styles.fareRow}>
                  <Text style={styles.fareText}>₹{ride.fare}</Text>
                  <Ionicons name="arrow-forward" size={12} color={theme.colors.black} />
                </View>
                <View style={styles.triangle} />
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <View style={styles.hintBox}>
        <Ionicons name="information-circle-outline" size={14} color={theme.colors.onSurfaceVariant} />
        <Text style={styles.hintText}>Tap a marker to view ride details</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: theme.borderRadius.card,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  calloutContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    padding: 8,
    width: 120,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  riderName: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.black,
    marginBottom: 4,
  },
  fareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  fareText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.black,
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: theme.colors.white,
    position: 'absolute',
    bottom: -8,
  },
  hintBox: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.surfaceContainerHigh,
  },
  hintText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    fontWeight: '600',
  },
});
