import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Header from '@/components/Header';
import MatchCard from '@/components/MatchCard';
import { useRouter } from 'expo-router';

interface Match {
  _id?: string;
  id?: string;
  team1: string;
  team2: string;
  date: string;
  time: string;
  status: 'live' | 'upcoming' | 'completed';
  venue?: string;
  imageUrl?: string;
}

import apiClient from '@/lib/api';

export default function LeagueDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [leagueName, setLeagueName] = useState('League');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLeagueMatches();
  }, [id]);

  const fetchLeagueMatches = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getLeagueMatches(id as string);
      
      if (response.data) {
        if (Array.isArray(response.data)) {
          setMatches(response.data);
        } else if (response.data.matches) {
          setMatches(response.data.matches);
          if (response.data.leagueName) {
            setLeagueName(response.data.leagueName);
          }
        }
      } else {
        console.error('Failed to fetch league matches:', response.error);
      }
    } catch (error) {
      console.error('Error fetching league matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLeagueMatches();
    setRefreshing(false);
  };

  const handleMatchPress = (matchId: string) => {
    router.push(`/match/${matchId}`);
  };

  return (
    <View style={styles.container}>
      <Header title={leagueName} showBackButton />
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6D28D9" colors={["#6D28D9"]} />
        }
      >
        <View style={styles.matchesList}>
          {loading && matches.length === 0 ? (
            <View style={styles.centerContainer}>
              <Text style={styles.loadingText}>Loading matches...</Text>
            </View>
          ) : matches.length > 0 ? (
            matches.map((match) => {
              const matchId = match.id || match._id;
              return (
                <MatchCard
                  key={matchId}
                  match={{ ...match, id: matchId as string }}
                  onPress={() => matchId && handleMatchPress(matchId)}
                />
              );
            })
          ) : (
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>No matches found for this league</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  matchesList: {
    paddingTop: 16,
  },
  centerContainer: {
    paddingVertical: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});