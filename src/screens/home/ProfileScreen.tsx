import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useAuth } from '../../services/AuthContext';
import { Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../../services/supabase';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const MENU_ITEMS = [
  { label: 'Edit Profile', icon: 'person-outline', nav: 'EditProfile', group: 'ACCOUNT' },
  { label: 'Verification Status', icon: 'shield-checkmark-outline', nav: 'EditProfile', badge: 'Verified ✓', group: 'ACCOUNT' },
  { label: 'My Rides', icon: 'document-text-outline', nav: 'MyRidesTab', group: 'ACTIVITY' },
  { label: 'Notifications', icon: 'notifications-outline', nav: 'Notifications', group: 'ACTIVITY' },
  { label: 'Report a User', icon: 'flag-outline', nav: 'Report', group: 'SAFETY' },
  { label: 'SOS & Emergency', icon: 'warning-outline', nav: 'SOSConfirm', group: 'SAFETY', danger: true },
];

export default function ProfileScreen() {
  const navigation = useNavigation<NavProp>();
  const { session, signOut } = useAuth();
  const [profile, setProfile] = React.useState<any>(null);
  const [stats, setStats] = React.useState({ rating: 4.8, totalRides: 0, saved: 0 });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchProfileData = async () => {
      if (!session?.user?.id) return;

      try {
        // Fetch Profile
        const { data: prof, error: profError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (prof) setProfile(prof);

        // Fetch Ride Stats (Count rides where user is driver or passenger)
        const { count: riderCount } = await supabase
          .from('rides')
          .select('*', { count: 'exact', head: true })
          .eq('driver_id', session.user.id);

        const { count: passengerCount } = await supabase
          .from('ride_requests')
          .select('*', { count: 'exact', head: true })
          .eq('passenger_id', session.user.id)
          .eq('status', 'accepted');

        setStats(prev => ({
          ...prev,
          totalRides: (riderCount || 0) + (passengerCount || 0),
          saved: (passengerCount || 0) * 25, // Mock saving calculation
        }));

      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [session]);

  const handleSignOut = () => {
    const confirmLogout = () => {
      signOut().catch((error: any) => {
        Alert.alert('Error', error.message);
      });
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to log out of your session?')) {
        confirmLogout();
      }
    } else {
      Alert.alert(
        'Log Out',
        'Are you sure you want to log out of your session?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Log Out', style: 'destructive', onPress: confirmLogout },
        ]
      );
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const groups = ['ACCOUNT', 'ACTIVITY', 'SAFETY'];

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Text style={styles.pageTitle}>Profile</Text>

        {/* Hero Profile Card */}
        <View style={styles.heroCard}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{getInitials(profile?.full_name)}</Text>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark" size={10} color={theme.colors.black} />
            </View>
          </View>
          <Text style={styles.profileName}>{profile?.full_name || 'Student Name'}</Text>
          <Text style={styles.profileCollege}>
            {profile?.college_name || 'Pune Institute of Technology'} · ID: {profile?.college_id || '---'}
          </Text>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.rating}</Text>
              <View style={styles.starsRow}>
                {[1,2,3,4].map(s => (
                  <Ionicons key={s} name="star" size={10} color={theme.colors.primary} />
                ))}
                <Ionicons name="star-half" size={10} color={theme.colors.primary} />
              </View>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalRides}</Text>
              <Text style={styles.statLabel}>Total Rides</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>₹{stats.saved}</Text>
              <Text style={styles.statLabel}>Saved</Text>
            </View>
          </View>
        </View>

        {/* My Vehicle — from Stitch design */}
        <View style={styles.vehicleCard}>
          <View style={styles.vehicleHeader}>
            <Text style={styles.cardSectionLabel}>MY VEHICLE</Text>
            <TouchableOpacity>
              <Text style={styles.editLink}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.vehicleRow}>
            <View style={styles.vehicleIcon}>
              <Ionicons name="bicycle-outline" size={28} color={theme.colors.black} />
            </View>
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleName}>TVS Apache RTR</Text>
              <Text style={styles.vehicleSub}>Sport Performance Edition</Text>
              <View style={styles.vehiclePlate}>
                <Text style={styles.vehiclePlateText}>MH 12 AB 3456</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Edit Profile Button */}
        <TouchableOpacity
          style={styles.editProfileButton}
          onPress={() => navigation.navigate('EditProfile')}
          activeOpacity={0.85}
        >
          <Ionicons name="create-outline" size={18} color={theme.colors.white} />
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </TouchableOpacity>

        {/* Menu Groups */}
        {groups.map((group) => {
          const items = MENU_ITEMS.filter((i) => i.group === group);
          return (
            <View key={group} style={styles.menuGroup}>
              <Text style={styles.groupLabel}>{group}</Text>
              <View style={styles.menuCard}>
                {items.map((item, idx) => (
                  <TouchableOpacity
                    key={item.label}
                    style={[styles.menuItem, idx === items.length - 1 && styles.menuItemLast]}
                    onPress={() => navigation.navigate(item.nav as any)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.menuIconBox, item.danger && styles.menuIconBoxDanger]}>
                      <Ionicons
                        name={item.icon as any}
                        size={20}
                        color={item.danger ? theme.colors.error : theme.colors.onSurfaceVariant}
                      />
                    </View>
                    <Text style={[styles.menuText, item.danger && styles.menuTextDanger]}>
                      {item.label}
                    </Text>
                    {item.badge ? (
                      <View style={styles.verifiedChip}>
                        <Text style={styles.verifiedChipText}>{item.badge}</Text>
                      </View>
                    ) : (
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={item.danger ? theme.colors.error : theme.colors.onSurfaceVariant}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })}

        {/* Log Out Button */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
          <Text style={styles.signOutText}>Log Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.l,
    paddingTop: theme.spacing.m,
    paddingBottom: 100,
  },

  pageTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.black,
    letterSpacing: -1,
    marginBottom: theme.spacing.xl,
  },

  heroCard: {
    backgroundColor: theme.colors.surfaceContainerLow,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.l,
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  avatarContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
    position: 'relative',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  avatarText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 36,
    fontWeight: '800',
    color: theme.colors.black,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.surfaceContainerLow,
  },
  profileName: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.black,
    marginBottom: 4,
  },
  profileCollege: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    marginBottom: theme.spacing.l,
    textAlign: 'center',
  },

  statsRow: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: 12,
    paddingVertical: theme.spacing.m,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.surfaceContainerHigh,
  },
  statValue: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.black,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 1,
  },
  statLabel: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    fontWeight: '600',
  },

  vehicleCard: {
    backgroundColor: theme.colors.surfaceContainerLow,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  cardSectionLabel: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: theme.colors.onSurfaceVariant,
  },
  editLink: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.m,
  },
  vehicleIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleInfo: { flex: 1 },
  vehicleName: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.black,
    marginBottom: 2,
  },
  vehicleSub: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 6,
  },
  vehiclePlate: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.surfaceContainerHigh,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  vehiclePlateText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.black,
    letterSpacing: 1,
  },

  editProfileButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.black,
    borderRadius: theme.borderRadius.button,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: theme.spacing.xl,
  },
  editProfileText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.white,
  },

  menuGroup: {
    marginBottom: theme.spacing.m,
  },
  groupLabel: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: theme.colors.onSurfaceVariant,
    marginBottom: theme.spacing.s,
    paddingHorizontal: 4,
  },
  menuCard: {
    backgroundColor: theme.colors.surfaceContainerLow,
    borderRadius: theme.borderRadius.card,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.m,
    gap: theme.spacing.m,
    // Dividers removed as per Anti-Divider Policy
  },
  menuItemLast: {},
  menuIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: theme.colors.surfaceContainerHigh,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIconBoxDanger: { backgroundColor: 'rgba(186, 26, 26, 0.1)' },
  menuText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily,
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.black,
  },
  menuTextDanger: { color: theme.colors.error },
  verifiedChip: {
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  verifiedChipText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.black,
  },

  safetyNote: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 214, 0, 0.12)',
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.m,
    gap: theme.spacing.s,
    marginTop: theme.spacing.s,
    alignItems: 'flex-start',
  },
  safetyText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily,
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
    lineHeight: 19,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(186, 26, 26, 0.05)',
    borderRadius: theme.borderRadius.button,
    height: 56,
    gap: 10,
    marginTop: theme.spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(186, 26, 26, 0.1)',
  },
  signOutText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.error,
  },
});
