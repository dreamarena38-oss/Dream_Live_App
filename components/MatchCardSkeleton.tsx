import React from 'react';
import { View, StyleSheet } from 'react-native';
import Skeleton from './Skeleton';

export default function MatchCardSkeleton() {
  return (
    <View style={styles.card}>
      <Skeleton width="100%" height={120} borderRadius={0} />
      <View style={styles.content}>
        <View style={styles.statusContainer}>
          <Skeleton width={60} height={12} borderRadius={6} />
        </View>
        
        <View style={styles.teamsContainer}>
          <View style={styles.teamSection}>
            <Skeleton width={40} height={40} borderRadius={20} />
            <Skeleton width={80} height={18} style={{ marginTop: 8 }} />
          </View>
          <View style={{ width: 40, alignItems: 'center' }}>
            <Skeleton width={20} height={14} />
          </View>
          <View style={styles.teamSection}>
            <Skeleton width={40} height={40} borderRadius={20} />
            <Skeleton width={80} height={18} style={{ marginTop: 8 }} />
          </View>
        </View>
        
        <View style={styles.detailsContainer}>
          <Skeleton width="60%" height={14} />
          <Skeleton width="40%" height={14} style={{ marginTop: 8 }} />
        </View>
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
    overflow: 'hidden',
  },
  content: {
    padding: 16,
  },
  statusContainer: {
    marginBottom: 12,
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  teamSection: {
    flex: 1,
    alignItems: 'center',
  },
  detailsContainer: {
    gap: 4,
  },
});
