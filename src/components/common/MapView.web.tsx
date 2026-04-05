import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const Marker = (props: any) => <View {...props}>{props.children}</View>;
export const Callout = (props: any) => <View {...props}>{props.children}</View>;
export const PROVIDER_GOOGLE = 'google';

const MapView = (props: any) => (
  <View style={[props.style, styles.placeholder]}>
    <Text style={styles.text}>Map is not available on web.</Text>
    <Text style={styles.subtext}>Coordinates are simulated for development.</Text>
  </View>
);

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#495057',
  },
  subtext: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
  },
});

export default MapView;
