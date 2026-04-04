import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { theme } from '../../theme/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../services/AuthContext';
import { Alert, ActivityIndicator, Image } from 'react-native';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'IDUpload'>;
};

export default function IDUploadScreen({ navigation }: Props) {
  const { session } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permission needed', 'You need to allow camera roll access to upload your ID.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadID = async () => {
    if (!image) {
      Alert.alert('No Image', 'Please capture or select an image of your ID first.');
      return;
    }
    if (!session?.user?.id) {
      Alert.alert('Error', 'User not authenticated. Please log in again.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(image);
      const blob = await response.blob();
      
      const fileExt = image.split('.').pop() || 'jpg';
      const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${session.user.id}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('id_documents')
        .upload(filePath, blob);

      if (error) throw error;
      
      navigation.navigate('PendingApproval');
    } catch (error: any) {
      Alert.alert('Upload Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
        
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Campus Verification</Text>
          <Text style={styles.subtitle}>Upload your student ID for safety verification. We review this manually.</Text>
        </View>

        <View style={styles.content}>
          <TouchableOpacity style={[styles.uploadCard, image && styles.uploadCardFilled]} onPress={pickImage}>
            {image ? (
              <Image source={{ uri: image }} style={styles.previewImage} />
            ) : (
              <>
                <View style={styles.iconContainer}>
                  <Ionicons name="camera-outline" size={40} color={theme.colors.onSurfaceVariant} />
                </View>
                <Text style={styles.uploadTitle}>Tap to scan Student ID</Text>
                <Text style={styles.uploadSubtitle}>Make sure your name and picture are clearly visible</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.primaryButton, (!image || loading) && { opacity: 0.7 }]}
          onPress={uploadID}
          disabled={!image || loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.onPrimary} />
          ) : (
            <Text style={styles.buttonText}>Submit ID</Text>
          )}
        </TouchableOpacity>
      </View>
        
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.l,
    paddingTop: theme.spacing.xxl,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.headline.fontSize,
    fontWeight: theme.typography.headline.fontWeight as any,
    letterSpacing: theme.typography.headline.letterSpacing,
    color: theme.colors.black,
    marginBottom: theme.spacing.s,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.onSurfaceVariant,
    lineHeight: theme.typography.body.lineHeight,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  uploadCard: {
    backgroundColor: theme.colors.surfaceContainerLow,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: theme.colors.outlineVariant,
    overflow: 'hidden',
  },
  uploadCardFilled: {
    padding: 0,
    borderWidth: 0,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.surfaceContainerHighest,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.l,
  },
  uploadTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.title.fontSize,
    fontWeight: theme.typography.title.fontWeight as any,
    color: theme.colors.black,
    marginBottom: theme.spacing.s,
    textAlign: 'center',
  },
  uploadSubtitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.button,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    shadowColor: theme.colors.onSurface,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
  },
  buttonText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.label.fontSize,
    fontWeight: theme.typography.label.fontWeight as any,
    color: theme.colors.onPrimary,
  },
});
