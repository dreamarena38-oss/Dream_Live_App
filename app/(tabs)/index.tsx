import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, Platform } from 'react-native';
import Header from '@/components/Header';
import Skeleton from '@/components/Skeleton';
import VideoPlayer from '@/components/VideoPlayer';
import MatchCard from '@/components/MatchCard';
import MatchCardSkeleton from '@/components/MatchCardSkeleton';
import { Calendar } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAutoRefresh } from '@/hooks/useRealTimeUpdates';
import apiClient, { ApiClient } from '@/lib/api';

interface Match {
  _id: string;
  team1: string;
  team2: string;
  date: string;
  time: string;
  status: 'live' | 'upcoming' | 'completed';
  venue?: string;
  imageUrl?: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [featuredVideo, setFeaturedVideo] = useState('dQw4w9WgXcQ');
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  const checkConnection = async () => {
    try {
      const response = await apiClient.healthCheck();
      if (response.data) {
        setConnectionStatus('connected');
        return true;
      } else {
        setConnectionStatus('disconnected');
        return false;
      }
    } catch (error) {
      setConnectionStatus('disconnected');
      return false;
    }
  };

  const fetchData = async () => {
    try {
      setError(null);

      // Fetch featured video and matches in parallel
      const [videoResponse, matchesResponse] = await Promise.all([
        apiClient.getFeaturedVideo(),
        apiClient.getMatches()
      ]);

      // If both fail and no cache, it's a connection issue
      if (videoResponse.status === 0 && matchesResponse.status === 0 && matches.length === 0) {
        setConnectionStatus('disconnected');
        setError('Unable to connect to service. Showing offline data if available.');
        setLoading(false);
        return;
      }

      setConnectionStatus('connected');

      // Process featured video
      if (videoResponse.data) {
        setFeaturedVideo(videoResponse.data.videoId);
      }

      // Process matches and pre-fetch images
      if (matchesResponse.data) {
        const topMatches = matchesResponse.data.slice(0, 5);
        setMatches(topMatches);
        
        // Pre-fetch team logos and match images for instant rendering
        const imageUrls = topMatches.flatMap(m => [m.imageUrl, m.team1Logo, m.team2Logo]);
        ApiClient.prefetchImages(imageUrls);
      } else if (matchesResponse.error && matches.length === 0) {
        setError(matchesResponse.error);
      }

      // Background Pre-fetching for other tabs to make them 0ms delay
      setTimeout(() => {
        apiClient.getHighlights();
        apiClient.getLeagues();
      }, 1000);

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Pull to refresh.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh when admin makes changes
  useAutoRefresh(fetchData, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMatchPress = (matchId: string) => {
    // Navigate to match details
    router.push(`/match/${matchId}`);
  };

  if (loading && matches.length === 0) {
    return (
      <View style={styles.container}>
        <Header title="Dream Live" />
        <ScrollView style={styles.content}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
          <View style={styles.section}>
            <Skeleton width="92%" height={220} style={{ marginHorizontal: '4%' }} />
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Live & Upcoming Matches</Text>
            <MatchCardSkeleton />
            <MatchCardSkeleton />
            <MatchCardSkeleton />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Dream Live" />

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 110 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6D28D9" colors={["#6D28D9"]} />
        }
      >
        {/* Connection Status */}
        {connectionStatus === 'disconnected' && (
          <View style={styles.connectionError}>
            <Text style={styles.connectionErrorText}>
              ⚠️ Unable to connect to the live service. Attempting to reconnect...
            </Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* What's New Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's New</Text>
          <VideoPlayer videoId={featuredVideo} autoplay={false} height={220} />
        </View>

        {/* Live Matches Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Live & Upcoming Matches</Text>
          {matches.length > 0 ? (
            matches.map((match) => (
              <MatchCard
                key={match._id}
                match={{
                  id: match._id,
                  team1: match.team1,
                  team2: match.team2,
                  date: match.date,
                  time: match.time,
                  status: match.status,
                  venue: match.venue,
                  imageUrl: match.imageUrl
                }}
                onPress={() => handleMatchPress(match._id)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Calendar size={64} color="#475569" />
              <Text style={styles.emptyText}>No matches available</Text>
              {connectionStatus === 'disconnected' ? (
                <Text style={styles.emptyHint}>
                  Connect to the backend to see live data
                </Text>
              ) : (
                <Text style={styles.emptyHint}>
                  Check back later for upcoming games!
                </Text>
              )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  connectionText: {
    fontSize: 14,
    color: '#0F172A',
  },
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
  errorContainer: {
    backgroundColor: '#FEE2E2',
    margin: 16,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  errorHint: {
    color: '#7F1D1D',
    fontSize: 12,
    fontStyle: 'italic',
  },
  section: {
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    opacity: 0.8,
  },
});