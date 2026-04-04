import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../services/AuthContext';

// Auth
import SplashScreen from '../screens/auth/SplashScreen';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import OTPScreen from '../screens/auth/OTPScreen';
import ProfileSetupScreen from '../screens/auth/ProfileSetupScreen';
import IDUploadScreen from '../screens/auth/IDUploadScreen';
import PendingApprovalScreen from '../screens/auth/PendingApprovalScreen';

// Main Tab Shell
import MainTabNavigator from './MainTabNavigator';

// Rider flows (pushed over tabs)
import OfferRideScreen from '../screens/rider/OfferRideScreen';
import FarePreviewScreen from '../screens/rider/FarePreviewScreen';
import RideRequestsScreen from '../screens/rider/RideRequestsScreen';
import ActiveRideScreen from '../screens/rider/ActiveRideScreen';

// Passenger flows (pushed over tabs)
import FindRideScreen from '../screens/passenger/FindRideScreen';
import RequestingRideScreen from '../screens/passenger/RequestingRideScreen';
import RideListScreen from '../screens/passenger/RideListScreen';
import RideDetailScreen from '../screens/passenger/RideDetailScreen';
import RequestSentScreen from '../screens/passenger/RequestSentScreen';
import RideConfirmedScreen from '../screens/passenger/RideConfirmedScreen';

// Post-Ride (pushed over tabs)
import PaymentScreen from '../screens/postride/PaymentScreen';
import RatingScreen from '../screens/postride/RatingScreen';
import RideSummaryScreen from '../screens/postride/RideSummaryScreen';

// Safety (modal-style over everything)
import SOSConfirmScreen from '../screens/safety/SOSConfirmScreen';
import SOSActivatedScreen from '../screens/safety/SOSActivatedScreen';

// Profile detail screens (pushed over tabs)
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import ReportScreen from '../screens/profile/ReportScreen';
import ChatScreen from '../screens/common/ChatScreen';

export type RootStackParamList = {
  // ── Bootstrap ──
  Splash: undefined;
  // ── Auth ──
  Welcome: undefined;
  SignUp: undefined;
  Login: undefined;
  OTP: undefined;
  ProfileSetup: undefined;
  IDUpload: undefined;
  PendingApproval: undefined;
  // ── Main App (tabs live here) ──
  MainTabs: undefined;
  // ── Rider ──
  OfferRide: {
    prefillStart?: string;
    prefillLat?: number;
    prefillLng?: number;
  } | undefined;
  FarePreview: {
    startLocation: string;
    destination: string;
    date: string;
    time: string;
    seats: number;
    genderPref: string;
  };
  RideRequests: undefined;
  ActiveRide: {
    rideId: string;
  };
  // ── Passenger ──
  FindRide: undefined;
  RequestingRide: undefined;
  RideList: {
    pickup: string;
    destination: string;
  };
  RideDetail: {
    ride: any;
  };
  RequestSent: {
    requestId: string;
    rideId: string;
  };
  RideConfirmed: {
    rideId: string;
  };
  // ── Post-Ride ──
  Payment: undefined;
  Rating: undefined;
  RideSummary: undefined;
  // ── Safety ──
  SOSConfirm: undefined;
  SOSActivated: undefined;
  // ── Profile detail ──
  EditProfile: undefined;
  Report: undefined;
  // ── Communication ──
  Chat: {
    rideId: string;
    otherName: string;
  };
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { session, loading } = useAuth();

  if (loading) {
    return <SplashScreen navigation={null as any} />;
  }

  return (
    <RootStack.Navigator
      screenOptions={{ headerShown: false }}
    >
      {!session ? (
        <>
          <RootStack.Screen name="Welcome" component={WelcomeScreen} />
          <RootStack.Screen name="Login" component={LoginScreen} />
          <RootStack.Screen name="SignUp" component={SignUpScreen} />
          <RootStack.Screen name="OTP" component={OTPScreen} />
        </>
      ) : (
        <>
          {/* Splash handles the initial redirect (Profile check) after login */}
          <RootStack.Screen name="Splash" component={SplashScreen} />
          <RootStack.Screen name="MainTabs" component={MainTabNavigator} />
          
          {/* Auth completion flow within session */}
          <RootStack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
          <RootStack.Screen name="IDUpload" component={IDUploadScreen} />
          <RootStack.Screen name="PendingApproval" component={PendingApprovalScreen} />

          {/* ── Rider Flows ── */}
          <RootStack.Screen name="OfferRide" component={OfferRideScreen} />
          <RootStack.Screen name="FarePreview" component={FarePreviewScreen} />
          <RootStack.Screen name="RideRequests" component={RideRequestsScreen} />
          <RootStack.Screen name="ActiveRide" component={ActiveRideScreen} />

          {/* ── Passenger Flows ── */}
          <RootStack.Screen name="FindRide" component={FindRideScreen} />
          <RootStack.Screen name="RequestingRide" component={RequestingRideScreen} />
          <RootStack.Screen name="RideList" component={RideListScreen} />
          <RootStack.Screen name="RideDetail" component={RideDetailScreen} />
          <RootStack.Screen name="RequestSent" component={RequestSentScreen} />
          <RootStack.Screen name="RideConfirmed" component={RideConfirmedScreen} />

          {/* ── Post-Ride ── */}
          <RootStack.Screen name="Payment" component={PaymentScreen} />
          <RootStack.Screen name="Rating" component={RatingScreen} />
          <RootStack.Screen
            name="RideSummary"
            component={RideSummaryScreen}
            options={{ gestureEnabled: false }}
          />

          {/* ── Safety ── */}
          <RootStack.Screen
            name="SOSConfirm"
            component={SOSConfirmScreen}
            options={{ animation: 'fade' }}
          />
          <RootStack.Screen
            name="SOSActivated"
            component={SOSActivatedScreen}
            options={{ animation: 'fade', gestureEnabled: false }}
          />

          {/* ── Profile Detail Screens ── */}
          <RootStack.Screen name="EditProfile" component={EditProfileScreen} />
          <RootStack.Screen name="Report" component={ReportScreen} />
          <RootStack.Screen name="Chat" component={ChatScreen} />
        </>
      )}
    </RootStack.Navigator>
  );
}
