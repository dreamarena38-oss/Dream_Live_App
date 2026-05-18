import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { Trophy, Filter, Star, Play } from 'lucide-react-native';
import Header from '@/components/Header';
import VideoCard from '@/components/VideoCard';
import VideoCardSkeleton from '@/components/VideoCardSkeleton';
import NetworkErrorBanner from '@/components/NetworkErrorBanner';
import { useRouter } from 'expo-router';
import { useAutoRefresh } from '@/hooks/useRealTimeUpdates';
import apiClient from '@/lib/api';
import { Highlight } from '@/types';

export default function HighlightsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [filteredHighlights, setFilteredHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [selectedSport, setSelectedSport] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  const sportCategories = ['All', 'Football', 'Basketball', 'Soccer', 'Tennis', 'Baseball', 'Hockey'];

  const fetchHighlights = async () => {
    try {
      const response = await apiClient.getHighlights();
      if (response.data) {
        const formattedHighlights = response.data.map(highlight => ({
          ...highlight,
          id: highlight._id || highlight.id,
          _id: highlight._id || highlight.id
        }));
        setHighlights(formattedHighlights);
        setFilteredHighlights(formattedHighlights);
        setConnectionStatus('connected');
      } else {
        console.error('Failed to fetch highlights:', response.error);
        setConnectionStatus('disconnected');
        // Fallback sample data
        const sampleHighlights: Highlight[] = [
          {
            _id: '1',
            id: '1',
            title: 'Best Football Touchdowns of the Week',
            thumbnailUrl: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=800',
            duration: '8:45',
            uploadDate: '2 days ago',
            videoId: 'dQw4w9WgXcQ',
            category: 'Sports',
            sport: 'Football',
            featured: true,
            views: 125000
          },
          {
            _id: '2',
            id: '2',
            title: 'Amazing Basketball Dunks Compilation',
            thumbnailUrl: 'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg?auto=compress&cs=tinysrgb&w=800',
            duration: '6:30',
            uploadDate: '1 day ago',
            videoId: 'dQw4w9WgXcQ',
            category: 'Sports',
            sport: 'Basketball',
            featured: false,
            views: 89000
          },
          {
            _id: '3',
            id: '3',
            title: 'Soccer Goals That Broke the Internet',
            thumbnailUrl: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=800',
            duration: '10:15',
            uploadDate: '3 days ago',
            videoId: 'dQw4w9WgXcQ',
            category: 'Sports',
            sport: 'Soccer',
            featured: true,
            views: 200000
          }
        ];
        setHighlights(sampleHighlights);
        setFilteredHighlights(sampleHighlights);
      }
    } catch (error) {
      console.error('Error fetching highlights:', error);
      setConnectionStatus('disconnected');
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh when admin makes changes
  useAutoRefresh(fetchHighlights, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHighlights();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchHighlights();
  }, []);

  useEffect(() => {
    if (selectedSport === 'All') {
      setFilteredHighlights(highlights);
    } else {
      setFilteredHighlights(highlights.filter(highlight => highlight.sport === selectedSport));
    }
  }, [selectedSport, highlights]);

  const handleVideoPress = (videoId: string) => {
    // Use the highlight ID instead of videoId for proper routing
    router.push(`/video/${videoId}?type=highlight`);
  };

  const handleSportFilter = (sport: string) => {
    setSelectedSport(sport);
    setShowFilters(false);
  };

  const featuredHighlights = filteredHighlights.filter(highlight => highlight.featured);
  const regularHighlights = filteredHighlights.filter(highlight => !highlight.featured);

  if (loading && highlights.length === 0) {
    return (
      <View style={styles.container}>
        <Header title="Sports Highlights" />
        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 110 }}>
          <VideoCardSkeleton />
          <VideoCardSkeleton />
          <VideoCardSkeleton />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Sports Highlights" />
      
      {/* Filter Section */}
      <View style={styles.filterSection}>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color="#FFFFFF" />
          <Text style={styles.filterButtonText}>
            {selectedSport === 'All' ? 'All Sports' : selectedSport}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter Options */}
      {showFilters && (
        <View style={styles.filterOptions}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {sportCategories.map((sport) => (
              <TouchableOpacity
                key={sport}
                style={[
                  styles.sportChip,
                  selectedSport === sport && styles.sportChipActive
                ]}
                onPress={() => handleSportFilter(sport)}
              >
                <Text style={[
                  styles.sportChipText,
                  selectedSport === sport && styles.sportChipTextActive
                ]}>
                  {sport}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 110 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6D28D9" colors={["#6D28D9"]} />
        }
      >
        <NetworkErrorBanner visible={connectionStatus === 'disconnected'} />
        
        {/* Featured Highlights */}
        {featuredHighlights.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Star size={24} color="#FFD700" />
              <Text style={styles.sectionTitle}>Featured Highlights</Text>
            </View>
            {featuredHighlights.map((highlight) => (
              <View key={highlight.id} style={styles.featuredCard}>
                <VideoCard
                  video={{
                    id: highlight.id || '',
                    title: highlight.title,
                    thumbnailUrl: highlight.thumbnailUrl,
                    duration: highlight.duration,
                    uploadDate: highlight.uploadDate,
                    videoId: highlight.videoId,
                    category: highlight.category
                  }}
                  onPress={() => handleVideoPress(highlight.id || '')}
                />
                <View style={styles.featuredBadge}>
                  <Star size={16} color="#FFD700" fill="#FFD700" />
                  <Text style={styles.featuredText}>Featured</Text>
                </View>
                <View style={styles.highlightMeta}>
                  <Text style={styles.sportTag}>{highlight.sport}</Text>
                  <Text style={styles.viewCount}>{highlight.views?.toLocaleString()} views</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Regular Highlights */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Play size={24} color="#6D28D9" />
            <Text style={styles.sectionTitle}>
              {selectedSport === 'All' ? 'All Highlights' : `${selectedSport} Highlights`}
            </Text>
          </View>
          
          {regularHighlights.length > 0 ? (
            regularHighlights.map((highlight) => (
              <View key={highlight.id} style={styles.highlightCard}>
                <VideoCard
                  video={{
                    id: highlight.id || '',
                    title: highlight.title,
                    thumbnailUrl: highlight.thumbnailUrl,
                    duration: highlight.duration,
                    uploadDate: highlight.uploadDate,
                    videoId: highlight.videoId,
                    category: highlight.category
                  }}
                  onPress={() => handleVideoPress(highlight.id || '')}
                />
                <View style={styles.highlightMeta}>
                  <Text style={styles.sportTag}>{highlight.sport}</Text>
                  <Text style={styles.viewCount}>{highlight.views?.toLocaleString()} views</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Trophy size={64} color="#475569" />
              <Text style={styles.emptyText}>
                {selectedSport === 'All' 
                  ? 'No highlights available' 
                  : `No ${selectedSport} highlights found`
                }
              </Text>
              <Text style={styles.emptySubtext}>
                Check back later for amazing sports moments!
              </Text>
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
    color: '#1F2937',
  },
  filterSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 8,
  },
  filterButtonText: {
    color: '#1F2937',
    fontSize: 14,
    fontWeight: '600',
  },
  filterOptions: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  sportChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  sportChipActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#1E293B',
  },
  sportChipText: {
    color: '#1F2937',
    fontSize: 14,
    fontWeight: '500',
  },
  sportChipTextActive: {
    color: '#0F172A',
    fontWeight: '600',
  },
  section: {
    marginTop: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  featuredCard: {
    position: 'relative',
    marginBottom: 16,
  },
  featuredBadge: {
    position: 'absolute',
    top: 16,
    right: 32,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    zIndex: 10,
  },
  featuredText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
  },
  highlightCard: {
    marginBottom: 16,
  },
  highlightMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  sportTag: {
    backgroundColor: '#FFFFFF',
    color: '#6D28D9',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  viewCount: {
    color: '#1F2937',
    fontSize: 12,
    opacity: 0.8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
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