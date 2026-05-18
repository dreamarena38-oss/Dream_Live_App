import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import Header from '@/components/Header';
import LeagueCard from '@/components/LeagueCard';
import LeagueCardSkeleton from '@/components/LeagueCardSkeleton';
import NetworkErrorBanner from '@/components/NetworkErrorBanner';
import { Trophy } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAutoRefresh } from '@/hooks/useRealTimeUpdates';
import apiClient from '@/lib/api';
import { League } from '@/types';

export default function LeaguesScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  const fetchLeagues = async () => {
    try {
      const response = await apiClient.getLeagues();
      if (response.data) {
        const formattedLeagues = response.data.map((league: any) => ({
          ...league,
          id: league._id || league.id
        }));
        setLeagues(formattedLeagues);
        setConnectionStatus('connected');
      } else {
        console.error('Failed to fetch leagues:', response.error);
        setConnectionStatus('disconnected');
      }
    } catch (error) {
      console.error('Error fetching leagues:', error);
      setConnectionStatus('disconnected');
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh when admin makes changes
  useAutoRefresh(fetchLeagues, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLeagues();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchLeagues();
  }, []);

  const handleLeaguePress = (leagueId: string) => {
    // Navigate to league details
    router.push(`/league/${leagueId}`);
  };

  return (
    <View style={styles.container}>
      <Header title="Leagues" />
      
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 110 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6D28D9" colors={["#6D28D9"]} />
        }
      >
        <NetworkErrorBanner visible={connectionStatus === 'disconnected'} />
        
        <View style={styles.leaguesList}>
          {loading && leagues.length === 0 ? (
            <>
              <LeagueCardSkeleton />
              <LeagueCardSkeleton />
              <LeagueCardSkeleton />
            </>
          ) : leagues.length > 0 ? (
            leagues.map((league) => (
              <LeagueCard
                key={league.id}
                league={league}
                onPress={() => handleLeaguePress(league.id || '')}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Trophy size={64} color="#6D28D9" />
              <Text style={styles.emptyText}>No leagues available</Text>
              <Text style={styles.emptySubtext}>Check back later for new leagues and tournaments!</Text>
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
  leaguesList: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Sportypo',
    color: '#1F2937',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    opacity: 0.8,
  },
});