import React from 'react';
import { View, StyleSheet } from 'react-native';
import Skeleton from './Skeleton';

export default function LeagueCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Skeleton width={48} height={48} borderRadius={24} style={styles.logo} />
        <View style={styles.info}>
          <Skeleton width="60%" height={18} style={{ marginBottom: 8 }} />
          <Skeleton width="40%" height={14} />
        </View>
      </View>
      <View style={styles.footer}>
        <Skeleton width="30%" height={14} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#E5E7EB',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  logo: {
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
