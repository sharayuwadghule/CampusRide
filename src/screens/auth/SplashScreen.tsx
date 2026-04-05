import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { theme } from '../../theme/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useAuth } from '../../services/AuthContext';
import { supabase } from '../../services/supabase';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Splash'>;
};

export default function SplashScreen({ navigation }: Props) {
  const { session, loading } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    if (!loading) {
      const timer = setTimeout(async () => {
        if (session) {
          // Check if profile is complete
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', session.user.id)
            .single();

          if (profile && profile.full_name) {
            navigation.replace('MainTabs');
          } else {
            navigation.replace('ProfileSetup');
          }
        } else {
          navigation.replace('Welcome');
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [navigation, session, loading]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* Logo mark */}
        <View style={styles.logoMark}>
          <Text style={styles.logoText}>CR.</Text>
        </View>

        {/* Brand name */}
        <View style={styles.brandRow}>
          <Text style={styles.brandName}>Campus</Text>
          <Text style={styles.brandAccent}>Ride</Text>
        </View>

        {/* Tagline */}
        <Text style={styles.tagline}>Rides by students, for students.</Text>
      </Animated.View>

      {/* Bottom version tag */}
      <View style={styles.footer}>
        <View style={styles.footerDot} />
        <Text style={styles.footerText}>Verified Campus Network</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.black,
    paddingHorizontal: theme.spacing.l,
    justifyContent: 'center',
    paddingBottom: 48,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  logoMark: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 8,
  },
  logoText: {
    color: theme.colors.black,
    fontFamily: theme.typography.fontFamily,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: theme.spacing.m,
  },
  brandName: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily,
    fontSize: 52,
    fontWeight: '800',
    letterSpacing: -2,
  },
  brandAccent: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fontFamily,
    fontSize: 52,
    fontWeight: '800',
    letterSpacing: -2,
    marginLeft: 6,
  },
  tagline: {
    color: 'rgba(255,255,255,0.5)',
    fontFamily: theme.typography.fontFamily,
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  footerText: {
    color: 'rgba(255,255,255,0.4)',
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
