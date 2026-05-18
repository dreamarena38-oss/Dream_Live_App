import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Trophy, Calendar } from 'lucide-react-native';
import { ApiClient } from '@/lib/api';
import { League } from '@/types';

interface LeagueCardProps {
  league: League;
  onPress: () => void;
}

export default function LeagueCard({ league, onPress }: LeagueCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        {league.logoUrl ? (
          <Image 
            source={{ uri: ApiClient.optimizeImage(league.logoUrl, 100) }} 
            style={styles.logo} 
            contentFit="cover"
          />
        ) : (
          <View style={styles.logoPlaceholder}>
            <Trophy size={32} color="#6D28D9" />
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.name}>{league.name}</Text>
          <Text style={styles.season}>{league.season}</Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <View style={styles.matchInfo}>
          <Calendar size={16} color="#6D28D9" />
          <Text style={styles.matchCount}>{league.matchCount} matches</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#6D28D9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  logoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontFamily: 'Sportypo',
    color: '#1F2937',
    marginBottom: 4,
  },
  season: {
    fontSize: 14,
    color: '#6B7280',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  matchCount: {
    fontSize: 14,
    color: '#6B7280',
  },
});