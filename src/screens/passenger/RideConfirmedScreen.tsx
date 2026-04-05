import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { supabase } from '../../services/supabase';
import MapView, { Marker, PROVIDER_GOOGLE } from '../../components/common/MapView';
import * as Location from 'expo-location';
import { estimateWalkingDistance, estimateTravelTime, getHaversineDistance } from '../../utils/geospatial';

type Props = NativeStackScreenProps<RootStackParamList, 'RideConfirmed'>;

export default function RideConfirmedScreen({ navigation, route }: Props) {
  const { rideId } = route.params;
  const [shareLocation, setShareLocation] = useState(false);
  const [ride, setRide] = useState<any>(null);
  const [riderLoc, setRiderLoc] = useState<{lat: number, lng: number} | null>(null);
  const [userLoc, setUserLoc] = useState<{lat: number, lng: number} | null>(null);

  const [distanceToPickup, setDistanceToPickup] = useState<number | null>(null);
  const [eta, setEta] = useState<number | null>(null);

  useEffect(() => {
    const fetchRide = async () => {
      const { data } = await supabase
        .from('rides')
        .select('*, profiles(*)')
        .eq('id', rideId)
        .single();
      if (data) {
        setRide(data);
        if (data.driver_lat && data.driver_lng) {
          setRiderLoc({ lat: data.driver_lat, lng: data.driver_lng });
        }
      }
    };
    fetchRide();

    let userLocationSubscription: any = null;
    const startUserLoc = async () => {
      userLocationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 10000,
          distanceInterval: 10,
        },
        (location) => {
          setUserLoc({ lat: location.coords.latitude, lng: location.coords.longitude });
        }
      );
    };
    startUserLoc();

    const channel = supabase
      .channel(`ride_tracking:${rideId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'rides', filter: `id=eq.${rideId}` },
        (payload) => {
          const updated = payload.new;
          if (updated.driver_lat && updated.driver_lng) {
            setRiderLoc({ lat: updated.driver_lat, lng: updated.driver_lng });
          }
          if (updated.status === 'completed') {
            navigation.navigate('Rating');
          }
        }
      )
      .subscribe();

    return () => { 
      supabase.removeChannel(channel); 
      userLocationSubscription?.remove();
    };
  }, [rideId]);

  useEffect(() => {
    if (riderLoc && userLoc) {
      const d = getHaversineDistance(riderLoc.lat, riderLoc.lng, userLoc.lat, userLoc.lng);
      setEta(estimateTravelTime(d));
    }
  }, [riderLoc, userLoc]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>

        {/* Confirmation Header */}
        <View style={styles.confirmHeader}>
          <View style={styles.confirmIcon}>
            <Ionicons name="checkmark-circle" size={32} color={theme.colors.black} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.confirmTitle}>Ride Confirmed!</Text>
            <Text style={styles.confirmSub}>{ride?.profiles?.full_name || 'Rider'} is on the way.</Text>
          </View>
        </View>

        {/* Live Map Area */}
        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={riderLoc ? {
              latitude: (riderLoc.lat + (userLoc?.lat || riderLoc.lat)) / 2,
              longitude: (riderLoc.lng + (userLoc?.lng || riderLoc.lng)) / 2,
              latitudeDelta: Math.max(0.015, Math.abs(riderLoc.lat - (userLoc?.lat || riderLoc.lat)) * 2),
              longitudeDelta: Math.max(0.015, Math.abs(riderLoc.lng - (userLoc?.lng || riderLoc.lng)) * 2),
            } : undefined}
          >
            {riderLoc && (
              <Marker
                coordinate={{ latitude: riderLoc.lat, longitude: riderLoc.lng }}
                title="Rider Location"
              >
                <View style={styles.riderMarker}>
                  <Ionicons name="bicycle" size={20} color={theme.colors.white} />
                </View>
              </Marker>
            )}
            {userLoc && (
              <Marker
                coordinate={{ latitude: userLoc.lat, longitude: userLoc.lng }}
                title="Your Location"
              >
                <View style={[styles.riderMarker, { backgroundColor: theme.colors.primary }]}>
                  <Ionicons name="person" size={20} color={theme.colors.black} />
                </View>
              </Marker>
            )}
          </MapView>
          {/* Floating ETA */}
          <View style={styles.etaFloat}>
            <Text style={styles.etaText}>
              {eta ? `Rider is ${eta} min away` : 'Estimating ETA...'}
            </Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
          {/* Rider Card */}
          <View style={styles.riderCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {ride?.profiles?.full_name?.substring(0,2).toUpperCase() || 'RV'}
              </Text>
            </View>
            <View style={styles.riderDetails}>
              <Text style={styles.riderName}>{ride?.profiles?.full_name || 'Arjun Verma'}</Text>
              <View style={styles.verifiedRow}>
                <Ionicons name="checkmark-circle" size={14} color={theme.colors.primary} />
                <Text style={styles.verifiedText}>ID Verified</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Chat', { rideId, otherName: ride?.profiles?.full_name })}
            >
              <Ionicons name="chatbubble-outline" size={20} color={theme.colors.black} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, { marginLeft: 8 }]}
              onPress={() => Alert.alert('Call', 'Connecting to rider...')}
            >
              <Ionicons name="call-outline" size={20} color={theme.colors.black} />
            </TouchableOpacity>
          </View>

          {/* Vehicle & Distance Card */}
          <View style={styles.metaCard}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>VEHICLE</Text>
              <Text style={styles.metaValue}>{ride?.vehicle || 'Honda Activa'}</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>DIST. TO PICKUP</Text>
              <Text style={styles.metaValue}>~450m</Text>
            </View>
          </View>

          {/* Share Location Toggle */}
          <View style={styles.toggleCard}>
            <View style={styles.toggleTextGroup}>
              <Text style={styles.toggleTitle}>Share Live Location</Text>
              <Text style={styles.toggleSub}>Lets trusted contacts track this ride</Text>
            </View>
            <Switch
              value={shareLocation}
              onValueChange={setShareLocation}
              trackColor={{ false: theme.colors.surfaceContainerHighest, true: '#2E7D32' }}
              thumbColor={shareLocation ? theme.colors.white : theme.colors.background}
            />
          </View>

          {/* SOS Button */}
          <TouchableOpacity 
            style={styles.sosButton} 
            activeOpacity={0.75} 
            onPress={() => navigation.navigate('SOSConfirm')}
          >
            <Ionicons name="warning-outline" size={22} color={theme.colors.white} style={{ marginRight: 8 }} />
            <Text style={styles.sosText}>SOS — Emergency Alert</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => navigation.navigate('MainTabs')}
          >
            <Text style={styles.homeButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </ScrollView>

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

  confirmHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
    gap: theme.spacing.m,
  },
  confirmIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.black,
  },
  confirmSub: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 13,
    color: 'rgba(0,0,0,0.6)',
  },

  mapContainer: {
    height: 220,
    backgroundColor: theme.colors.surfaceContainerHigh,
    borderRadius: theme.borderRadius.card,
    marginBottom: theme.spacing.m,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  riderMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.black,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.white,
  },
  etaFloat: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: theme.colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  etaText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.black,
  },

  riderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.m,
  },
  avatarText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.black,
  },
  riderDetails: { flex: 1 },
  riderName: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.black,
    marginBottom: 4,
  },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  verifiedText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.onSurfaceVariant,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
  },

  metaCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
  },
  metaItem: { flex: 1 },
  metaLabel: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 4,
  },
  metaValue: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.black,
  },
  metaDivider: {
    width: 1,
    backgroundColor: theme.colors.surfaceContainerLow,
    marginHorizontal: theme.spacing.m,
  },

  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
  },
  toggleTextGroup: {},
  toggleTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.black,
    marginBottom: 2,
  },
  toggleSub: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },

  sosButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.error,
    borderRadius: theme.borderRadius.button,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.error,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: theme.spacing.m,
  },
  sosText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.white,
  },

  homeButton: {
    backgroundColor: theme.colors.black,
    borderRadius: theme.borderRadius.button,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeButtonText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.white,
  },
});
