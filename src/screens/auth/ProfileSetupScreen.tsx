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
import { useAuth } from '../../services/AuthContext';
import { supabase } from '../../services/supabase';
import { Alert, ActivityIndicator } from 'react-native';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ProfileSetup'>;
};

type RoleType = 'passenger' | 'rider' | 'both';

export default function ProfileSetupScreen({ navigation }: Props) {
  const { session } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [college, setCollege] = useState('');
  const [selectedRole, setSelectedRole] = useState<RoleType>('passenger');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSaveProfile = async () => {
    if (!firstName || !lastName || !studentId || !college) {
      Alert.alert('Missing Fields', 'Please fill out all the fields.');
      return;
    }
    if (!session?.user?.id) {
      Alert.alert('Error', 'No authenticated user found. Please restart the app.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('profiles').upsert({
      id: session.user.id,
      full_name: `${firstName} ${lastName}`,
      college_id: studentId,
      college_name: college,
      role: selectedRole,
    });
    setLoading(false);

    if (error) {
      Alert.alert('Profile Setup Failed', error.message);
    } else {
      navigation.navigate('IDUpload');
    }
  };

  const ROLES: { key: RoleType; label: string; icon: any; sub: string }[] = [
    { key: 'passenger', label: 'Passenger', icon: 'person-outline', sub: 'Book rides to campus' },
    { key: 'rider', label: 'Rider', icon: 'bicycle-outline', sub: 'Offer rides & earn' },
    { key: 'both', label: 'Both', icon: 'swap-horizontal-outline', sub: 'Full flexibility' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back */}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.black} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.supLabel}>STEP 3 OF 3</Text>
            <Text style={styles.title}>Set up your{'\n'}profile.</Text>
            <Text style={styles.subtitle}>Tell us a bit about yourself to get started.</Text>
          </View>

          {/* Name row */}
          <View style={styles.nameRow}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>First Name</Text>
              <View style={[styles.inputWrapper, focusedField === 'first' && styles.inputFocused]}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Anjali"
                  placeholderTextColor={theme.colors.onSurfaceVariant}
                  value={firstName}
                  onChangeText={setFirstName}
                  onFocus={() => setFocusedField('first')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Last Name</Text>
              <View style={[styles.inputWrapper, focusedField === 'last' && styles.inputFocused]}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Sharma"
                  placeholderTextColor={theme.colors.onSurfaceVariant}
                  value={lastName}
                  onChangeText={setLastName}
                  onFocus={() => setFocusedField('last')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>
          </View>

          {/* Student ID */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Student ID Number</Text>
            <View style={[styles.inputWrapper, focusedField === 'sid' && styles.inputFocused]}>
              <Ionicons name="card-outline" size={18} color={theme.colors.onSurfaceVariant} style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="e.g. 2021CS0123"
                placeholderTextColor={theme.colors.onSurfaceVariant}
                value={studentId}
                onChangeText={setStudentId}
                onFocus={() => setFocusedField('sid')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>

          {/* College */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>College / University</Text>
            <View style={[styles.inputWrapper, focusedField === 'college' && styles.inputFocused]}>
              <Ionicons name="school-outline" size={18} color={theme.colors.onSurfaceVariant} style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="e.g. Pune Institute of Technology"
                placeholderTextColor={theme.colors.onSurfaceVariant}
                value={college}
                onChangeText={setCollege}
                onFocus={() => setFocusedField('college')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>

          {/* Role selector */}
          <View style={styles.roleSection}>
            <Text style={styles.label}>I want to</Text>
            <View style={styles.roleRow}>
              {ROLES.map((r) => (
                <TouchableOpacity
                  key={r.key}
                  style={[styles.roleCard, selectedRole === r.key && styles.roleCardActive]}
                  onPress={() => setSelectedRole(r.key)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={r.icon}
                    size={22}
                    color={selectedRole === r.key ? theme.colors.black : theme.colors.onSurfaceVariant}
                  />
                  <Text style={[styles.roleLabel, selectedRole === r.key && styles.roleLabelActive]}>
                    {r.label}
                  </Text>
                  <Text style={styles.roleSub}>{r.sub}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={[styles.primaryButton, loading && { opacity: 0.7 }]}
            onPress={handleSaveProfile}
            activeOpacity={0.88}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.onPrimary} />
            ) : (
              <>
                <Text style={styles.buttonText}>Continue to ID Upload</Text>
                <Ionicons name="arrow-forward" size={20} color={theme.colors.onPrimary} />
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            Your ID is used only to verify student status. It is never shared publicly.
          </Text>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  flex: { flex: 1 },
  scrollContent: {
    paddingHorizontal: theme.spacing.l,
    paddingTop: theme.spacing.m,
    paddingBottom: 48,
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
    lineHeight: 42,
    marginBottom: theme.spacing.m,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 15,
    color: theme.colors.onSurfaceVariant,
    lineHeight: 22,
  },

  nameRow: {
    flexDirection: 'row',
    gap: theme.spacing.m,
    marginBottom: theme.spacing.m,
  },
  inputGroup: {
    marginBottom: theme.spacing.m,
    gap: 6,
  },
  label: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.black,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 58,
    backgroundColor: theme.colors.surfaceContainerHighest,
    borderRadius: theme.borderRadius.card,
    paddingHorizontal: theme.spacing.m,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  inputFocused: {
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.black,
  },
  input: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 15,
    color: theme.colors.black,
    flex: 1,
  },

  roleSection: { marginBottom: theme.spacing.xl },
  roleRow: {
    flexDirection: 'row',
    gap: theme.spacing.s,
    marginTop: 8,
  },
  roleCard: {
    flex: 1,
    backgroundColor: theme.colors.surfaceContainerHighest,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.m,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  roleCardActive: {
    backgroundColor: theme.colors.primary,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  roleLabel: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.onSurfaceVariant,
  },
  roleLabelActive: { color: theme.colors.black },
  roleSub: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },

  primaryButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.button,
    height: 58,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: theme.spacing.m,
    shadowColor: theme.colors.onSurface,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
  },
  buttonText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.onPrimary,
  },
  disclaimer: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: theme.spacing.m,
  },
});
