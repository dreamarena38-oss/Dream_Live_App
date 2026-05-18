import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Calendar, MapPin } from 'lucide-react-native';
import apiClient, { ApiClient } from '@/lib/api';
import { Match } from '@/types';

interface MatchCardProps {
  match: Match;
  onPress: () => void;
}

export default function MatchCard({ match, onPress }: MatchCardProps) {
  const getStatusColor = () => {
    switch (match.status) {
      case 'live':
        return '#EF4444';
      case 'upcoming':
        return '#F59E0B';
      case 'completed':
        return '#10B981';
      default:
        return '#94A3B8';
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {match.imageUrl && (
        <Image 
          source={{ uri: ApiClient.optimizeImage(match.imageUrl, 400) }} 
          style={styles.image} 
          contentFit="cover"
          transition={200}
        />
      )}
      <View style={styles.content}>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
          <Text style={styles.statusText}>{match.status.toUpperCase()}</Text>
        </View>
        
        <View style={styles.teamsContainer}>
          <View style={styles.teamSection}>
            {match.team1Logo && (
              <Image 
                source={{ uri: ApiClient.optimizeImage(match.team1Logo, 100) }} 
                style={styles.teamLogo} 
                contentFit="cover"
              />
            )}
            <Text style={styles.teamText}>{match.team1}</Text>
          </View>
          <Text style={styles.vsText}>VS</Text>
          <View style={styles.teamSection}>
            {match.team2Logo && (
              <Image 
                source={{ uri: ApiClient.optimizeImage(match.team2Logo, 100) }} 
                style={styles.teamLogo} 
                contentFit="cover"
              />
            )}
            <Text style={styles.teamText}>{match.team2}</Text>
          </View>
        </View>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detail}>
            <Calendar size={16} color="#6D28D9" />
            <Text style={styles.detailText}>{match.date} • {match.time}</Text>
          </View>
          {match.venue && (
            <View style={styles.detail}>
              <MapPin size={16} color="#6D28D9" />
              <Text style={styles.detailText}>{match.venue}</Text>
            </View>
          )}
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
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 120,
  },
  content: {
    padding: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
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
    gap: 8,
  },
  teamLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  teamText: {
    fontSize: 18,
    fontFamily: 'Sportypo',
    color: '#1F2937',
    textAlign: 'center',
  },
  vsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginHorizontal: 16,
  },
  detailsContainer: {
    gap: 8,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
  },
});