import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { theme } from '../../theme/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Welcome'>;
};

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.black} />
      <View style={styles.container}>

        {/* Logo chip */}
        <View style={styles.logoChip}>
          <View style={styles.logoDot} />
          <Text style={styles.logoLabel}>CampusRide</Text>
        </View>

        {/* Hero content */}
        <View style={styles.heroContent}>
          <Text style={styles.heroHeadline}>Campus</Text>
          <Text style={styles.heroHeadlineAccent}>Ride.</Text>
          <Text style={styles.tagline}>
            Rides by students,{'\n'}for students.
          </Text>

          {/* Feature pills */}
          <View style={styles.pillsRow}>
            <View style={styles.pill}>
              <Ionicons name="shield-checkmark" size={14} color={theme.colors.primary} />
              <Text style={styles.pillText}>ID Verified</Text>
            </View>
            <View style={styles.pill}>
              <Ionicons name="people" size={14} color={theme.colors.primary} />
              <Text style={styles.pillText}>Campus Only</Text>
            </View>
            <View style={styles.pill}>
              <Ionicons name="star" size={14} color={theme.colors.primary} />
              <Text style={styles.pillText}>Rated & Safe</Text>
            </View>
          </View>
        </View>

        {/* Footer CTA */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('SignUp')}
            activeOpacity={0.88}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color={theme.colors.onPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Already part of the fleet?</Text>
            <Text style={styles.secondaryButtonLink}> Log In</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.black,
  },
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.l,
    paddingTop: theme.spacing.l,
    paddingBottom: 36,
  },

  logoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: theme.spacing.xxl,
  },
  logoDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  logoLabel: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 0.5,
  },

  heroContent: {
    flex: 1,
    justifyContent: 'center',
  },
  heroHeadline: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 64,
    fontWeight: '800',
    color: theme.colors.white,
    letterSpacing: -2.5,
    lineHeight: 64,
  },
  heroHeadlineAccent: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 64,
    fontWeight: '800',
    color: theme.colors.primary,
    letterSpacing: -2.5,
    lineHeight: 68,
    marginBottom: theme.spacing.l,
  },
  tagline: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 18,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 28,
    marginBottom: theme.spacing.xl,
  },

  pillsRow: {
    flexDirection: 'row',
    gap: theme.spacing.s,
    flexWrap: 'wrap',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 214, 0, 0.12)',
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  pillText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
  },

  footer: {
    gap: theme.spacing.m,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.button,
    height: 58,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 6,
  },
  primaryButtonText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.onPrimary,
  },
  secondaryButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 48,
  },
  secondaryButtonText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
  },
  secondaryButtonLink: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
  },
});
