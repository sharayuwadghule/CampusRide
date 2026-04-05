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
  StatusBar,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { supabase } from '../../services/supabase';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPassFocused, setIsPassFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          Alert.alert(
            'Verification Required',
            'Please check your email and click the confirmation link before logging in.'
          );
        } else {
          Alert.alert('Login Failed', error.message);
        }
      } else {
        // AppNavigator's useAuth hook will catch the session change
        // and automatically switch to the authenticated stack.
      }
    } catch (err: any) {
      Alert.alert(
        'Network Error',
        'Failed to connect to the backend. Please check your internet connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView 
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back button */}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.black} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Welcome{'\n'}back.</Text>
            <Text style={styles.subtitle}>
              Sign in to your @kbtcoe.org account to find or offer a ride.
            </Text>
          </View>

          {/* Email Input */}
          <View style={[styles.inputContainer, isEmailFocused && styles.inputFocused]}>
            <Ionicons name="mail-outline" size={20} color={theme.colors.black} style={{ marginRight: 12 }} />
            <View style={styles.divider} />
            <TextInput
              style={styles.input}
              placeholder="id.name@kbtcoe.org"
              placeholderTextColor={theme.colors.onSurfaceVariant}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setIsEmailFocused(true)}
              onBlur={() => setIsEmailFocused(false)}
            />
          </View>

          {/* Password Input */}
          <View style={[styles.inputContainer, isPassFocused && styles.inputFocused]}>
            <Ionicons name="key-outline" size={20} color={theme.colors.black} style={{ marginRight: 12 }} />
            <View style={styles.divider} />
            <TextInput
              style={styles.input}
              placeholder="Secure password"
              placeholderTextColor={theme.colors.onSurfaceVariant}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              onFocus={() => setIsPassFocused(true)}
              onBlur={() => setIsPassFocused(false)}
            />
          </View>

          <View style={{ flex: 1, minHeight: 32 }} />

          {/* CTA */}
          <TouchableOpacity
            style={[styles.primaryButton, (!email || !password || loading) && styles.primaryButtonDisabled]}
            onPress={handleLogin}
            activeOpacity={0.88}
            disabled={!email || !password || loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.onPrimary} />
            ) : (
              <>
                <Text style={styles.buttonText}>Log In</Text>
                <Ionicons name="log-in-outline" size={20} color={theme.colors.onPrimary} />
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.l,
    paddingTop: theme.spacing.m,
    paddingBottom: 36,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  header: { marginBottom: theme.spacing.xl },
  title: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 36,
    fontWeight: '800',
    color: theme.colors.black,
    letterSpacing: -1,
    marginBottom: theme.spacing.m,
    lineHeight: 42,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 15,
    color: theme.colors.onSurfaceVariant,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceContainerHighest,
    borderRadius: theme.borderRadius.card,
    paddingHorizontal: theme.spacing.m,
    height: 60,
    marginBottom: theme.spacing.m,
  },
  inputFocused: { backgroundColor: theme.colors.white, borderWidth: 1.5, borderColor: theme.colors.primary },
  divider: { width: 1, height: 24, backgroundColor: theme.colors.surfaceContainerHighest, marginRight: theme.spacing.m },
  input: { flex: 1, fontFamily: theme.typography.fontFamily, fontSize: 16, fontWeight: '600', color: theme.colors.black, letterSpacing: 0.5 },
  primaryButton: {
    flexDirection: 'row', backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.button, height: 58,
    justifyContent: 'center', alignItems: 'center', gap: 8, shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 4,
  },
  primaryButtonDisabled: { opacity: 0.55 },
  buttonText: { fontFamily: theme.typography.fontFamily, fontSize: 16, fontWeight: '700', color: theme.colors.onPrimary },
});
