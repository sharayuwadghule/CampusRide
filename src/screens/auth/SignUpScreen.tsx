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
  navigation: NativeStackNavigationProp<RootStackParamList, 'SignUp'>;
};

export default function SignUpScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPassFocused, setIsPassFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const handleSignUp = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail.toLowerCase().endsWith('@kbtcoe.org')) {
      Alert.alert('Invalid Domain', 'Only students with @kbtcoe.org emails are allowed.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
      });

      if (error) {
        if (error.message.includes('already registered') || error.message.includes('already present')) {
          Alert.alert('Account Exists', 'An account with this email is already registered. Please log in instead.');
        } else {
          Alert.alert('Sign Up Failed', error.message);
        }
      } else if (data?.user && !data?.session) {
        // Email confirmation is enabled, swap to Success View
        setSignupSuccess(true);
      } else {
        // Upon successful sign up (if email confirmation is turned off)
        Alert.alert('Success', 'Account created successfully!');
        navigation.navigate('ProfileSetup');
      }
    } catch (err: any) {
      Alert.alert(
        'Network Error',
        'Failed to connect to the Supabase backend. Please check your internet connection or verify that your .env keys are correct.'
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

          {signupSuccess ? (
            <View style={styles.successState}>
              <View style={styles.successIconBox}>
                <Ionicons name="checkmark-circle" size={48} color={theme.colors.primary} />
              </View>
              <Text style={[styles.title, { textAlign: 'center', fontSize: 32 }]}>Account created{'\n'}successfully!</Text>
              <Text style={[styles.subtitle, { textAlign: 'center', marginBottom: 40 }]}>
                We've sent a verification link to <Text style={{ fontWeight: '700', color: theme.colors.black }}>{email}</Text>. {'\n\n'}
                <Text style={{ fontWeight: '600' }}>IMPORTANT:</Text> You must click the link in your email to activate your account before you can log in.
              </Text>
              
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.88}
              >
                <Text style={styles.buttonText}>Log In Now</Text>
                <Ionicons name="checkmark-circle-outline" size={20} color={theme.colors.onPrimary} />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.supLabel}>STEP 1 OF 3</Text>
                <Text style={styles.title}>Your college{'\n'}email.</Text>
                <Text style={styles.subtitle}>
                  Only @kbtcoe.org addresses are permitted to join our campus network.
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

              {/* Note */}
              <View style={styles.noteRow}>
                <Ionicons name="lock-closed-outline" size={13} color={theme.colors.onSurfaceVariant} />
                <Text style={styles.noteText}>
                  Your information is securely encrypted via Supabase Auth.
                </Text>
              </View>

              <View style={{ flex: 1, minHeight: 32 }} />

              {/* CTA */}
              <TouchableOpacity
                style={[styles.primaryButton, (!email || password.length < 6 || loading) && styles.primaryButtonDisabled]}
                onPress={handleSignUp}
                activeOpacity={0.88}
                disabled={!email || password.length < 6 || loading}
              >
                {loading ? (
                  <ActivityIndicator color={theme.colors.onPrimary} />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Submit & Sign Up</Text>
                    <Ionicons name="arrow-forward" size={20} color={theme.colors.onPrimary} />
                  </>
                )}
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
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
  header: {
    marginBottom: theme.spacing.xl,
  },
  supLabel: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: theme.colors.primary,
    marginBottom: theme.spacing.s,
  },
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
  inputFocused: {
    backgroundColor: theme.colors.white,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: theme.colors.surfaceContainerHighest,
    marginRight: theme.spacing.m,
  },
  input: {
    flex: 1,
    fontFamily: theme.typography.fontFamily,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.black,
    letterSpacing: 0.5,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingHorizontal: 4,
    marginTop: theme.spacing.s,
  },
  noteText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    lineHeight: 18,
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
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 4,
  },
  primaryButtonDisabled: {
    opacity: 0.55,
  },
  buttonText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.onPrimary,
  },
  successState: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 60,
  },
  successIconBox: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 214, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: theme.spacing.xl,
  },
});
