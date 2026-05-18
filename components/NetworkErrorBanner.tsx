import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  visible: boolean;
  message?: string;
}

export default function NetworkErrorBanner({ visible, message = '⚠️ Unable to connect to the live service. Attempting to reconnect...' }: Props) {
  if (!visible) return null;

  return (
    <View style={styles.connectionError}>
      <Text style={styles.connectionErrorText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  connectionError: {
    backgroundColor: '#FEF3C7',
    margin: 16,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  connectionErrorText: {
    color: '#92400E',
    fontSize: 14,
    fontWeight: '500',
  },
});
