import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'OfferRide'>;
};

const SEAT_OPTIONS = [1, 2];
const GENDER_OPTIONS = ['Any', 'Female Only'];

export default function OfferRideScreen({ navigation }: Props) {
  const [startLocation, setStartLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [seats, setSeats] = useState(1);
  const [genderPref, setGenderPref] = useState('Any');
  const [startFocused, setStartFocused] = useState(false);
  const [destFocused, setDestFocused] = useState(false);

  const handleCalculateFare = () => {
    if (!startLocation || !destination || !date || !time) {
      Alert.alert('Incomplete Route', 'Please ensure your start, destination, date, and time are filled out.');
      return;
    }
    navigation.navigate('FarePreview', {
      startLocation,
      destination,
      date,
      time,
      seats,
      genderPref,
    });
  };

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
            <Text style={styles.headerTitle}>Offer a Ride</Text>
          </View>

          {/* Title Block */}
          <View style={styles.titleBlock}>
            <Text style={styles.pageTitle}>Set up your{'\n'}route.</Text>
            <Text style={styles.pageSub}>Choose your path — others will find you.</Text>
          </View>

          {/* Route Card */}
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>ROUTE</Text>

            <View style={[styles.inputRow, startFocused && styles.inputRowFocused]}>
              <View style={styles.pinDot} />
              <TextInput
                style={styles.input}
                placeholder="Starting point"
                placeholderTextColor={theme.colors.onSurfaceVariant}
                value={startLocation}
                onChangeText={setStartLocation}
                onFocus={() => setStartFocused(true)}
                onBlur={() => setStartFocused(false)}
              />
              {startLocation.length > 0 && (
                <TouchableOpacity onPress={() => setStartLocation('')}>
                  <Ionicons name="close-circle" size={18} color={theme.colors.onSurfaceVariant} />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.routeLine} />

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

          {/* Date & Time */}
          <View style={styles.rowTwoCards}>
            <TouchableOpacity style={styles.halfCard} activeOpacity={0.8}>
              <Ionicons name="calendar-outline" size={20} color={theme.colors.onSurfaceVariant} />
              <Text style={styles.halfCardLabel}>DATE</Text>
              <TextInput
                style={styles.halfCardValue}
                placeholder="DD/MM/YYYY"
                placeholderTextColor={theme.colors.onSurfaceVariant}
                value={date}
                onChangeText={setDate}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.halfCard} activeOpacity={0.8}>
              <Ionicons name="time-outline" size={20} color={theme.colors.onSurfaceVariant} />
              <Text style={styles.halfCardLabel}>TIME</Text>
              <TextInput
                style={styles.halfCardValue}
                placeholder="HH:MM AM"
                placeholderTextColor={theme.colors.onSurfaceVariant}
                value={time}
                onChangeText={setTime}
              />
            </TouchableOpacity>
          </View>

          {/* Seats */}
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>AVAILABLE SEATS</Text>
            <Text style={styles.sectionSub}>Two-wheelers: max 2 seats</Text>
            <View style={styles.chipRow}>
              {SEAT_OPTIONS.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.chip, seats === s && styles.chipActive]}
                  onPress={() => setSeats(s)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="person" size={16} color={seats === s ? theme.colors.onPrimary : theme.colors.onSurfaceVariant} />
                  <Text style={[styles.chipText, seats === s && styles.chipTextActive]}>
                    {s} Seat{s > 1 ? 's' : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Gender Preference */}
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>PASSENGER PREFERENCE</Text>
            <View style={styles.chipRow}>
              {GENDER_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.chip, genderPref === opt && styles.chipActive]}
                  onPress={() => setGenderPref(opt)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={opt === 'Female Only' ? 'female-outline' : 'people-outline'}
                    size={16}
                    color={genderPref === opt ? theme.colors.onPrimary : theme.colors.onSurfaceVariant}
                  />
                  <Text style={[styles.chipText, genderPref === opt && styles.chipTextActive]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Fare info hint */}
          <View style={styles.fareHint}>
            <Ionicons name="information-circle-outline" size={16} color={theme.colors.onSurfaceVariant} />
            <Text style={styles.fareHintText}>
              Fare is auto-calculated based on distance. Campus rides typically range ₹20–₹60.
            </Text>
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleCalculateFare}
            activeOpacity={0.88}
          >
            <Ionicons name="cash-outline" size={20} color={theme.colors.onPrimary} />
            <Text style={styles.buttonText}>Calculate Fare & Preview</Text>
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
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.m,
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
    marginBottom: 8,
  },
  pageSub: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 15,
    color: theme.colors.onSurfaceVariant,
  },

  card: {
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
    marginBottom: 4,
  },
  sectionSub: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginBottom: theme.spacing.m,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceContainerHighest,
    borderRadius: 12,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: 14,
    gap: theme.spacing.m,
    marginBottom: 4,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  inputRowFocused: {
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.black,
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
  routeLine: {
    width: 2,
    height: 16,
    backgroundColor: theme.colors.surfaceContainerHighest,
    marginLeft: 17,
    marginVertical: 3,
  },
  input: {
    flex: 1,
    fontFamily: theme.typography.fontFamily,
    fontSize: 15,
    color: theme.colors.black,
  },

  rowTwoCards: {
    flexDirection: 'row',
    gap: theme.spacing.m,
    marginBottom: theme.spacing.m,
  },
  halfCard: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.m,
    gap: 4,
  },
  halfCardLabel: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: theme.colors.onSurfaceVariant,
  },
  halfCardValue: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.black,
  },

  chipRow: {
    flexDirection: 'row',
    gap: theme.spacing.s,
    marginTop: 4,
  },
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceContainerHighest,
    borderRadius: theme.borderRadius.button,
    paddingVertical: 12,
    gap: 6,
  },
  chipActive: { backgroundColor: theme.colors.black },
  chipText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.onSurfaceVariant,
  },
  chipTextActive: { color: theme.colors.white },

  fareHint: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
    alignItems: 'flex-start',
  },
  fareHintText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily,
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
    lineHeight: 19,
  },

  primaryButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.button,
    height: 58,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
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
});
