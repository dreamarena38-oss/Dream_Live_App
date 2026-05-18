import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { Filter, Video as VideoIcon } from 'lucide-react-native';
import Header from '@/components/Header';
import VideoCard from '@/components/VideoCard';
import VideoCardSkeleton from '@/components/VideoCardSkeleton';
import NetworkErrorBanner from '@/components/NetworkErrorBanner';
import { useRouter } from 'expo-router';
import { useAutoRefresh } from '@/hooks/useRealTimeUpdates';
import apiClient from '@/lib/api';
import { Video } from '@/types';

export default function VideosScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Sport' | 'Podcast' | 'TV Show' | 'Other'>('All');
  const [showFilters, setShowFilters] = useState(false);

  const categories = ['All', 'Sport', 'Podcast', 'TV Show', 'Other'] as const;

  const fetchVideos = async () => {
    try {
      const response = await apiClient.getVideos();
      if (response.data) {
        const formattedVideos = response.data.map(video => ({
          ...video,
          id: video._id || video.id,
          _id: video._id || video.id
        }));
        setVideos(formattedVideos);
        setFilteredVideos(formattedVideos);
        setConnectionStatus('connected');
      } else {
        console.error('Failed to fetch videos:', response.error);
        setConnectionStatus('disconnected');
        // Fallback sample data with proper categories
        const sampleVideos: Video[] = [
          {
            _id: '1',
            id: '1',
            title: 'Best Football Goals of the Week',
            thumbnailUrl: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=800',
            duration: '8:45',
            uploadDate: '2 days ago',
            videoId: 'dQw4w9WgXcQ',
            category: 'Sport',
            views: 125000
          },
          {
            _id: '2',
            id: '2',
            title: 'Sports Talk Podcast - Episode 15',
            thumbnailUrl: 'https://images.pexels.com/photos/7130560/pexels-photo-7130560.jpeg?auto=compress&cs=tinysrgb&w=800',
            duration: '45:30',
            uploadDate: '1 day ago',
            videoId: 'dQw4w9WgXcQ',
            category: 'Podcast',
            views: 89000
          },
          {
            _id: '3',
            id: '3',
            title: 'Match of the Day Highlights',
            thumbnailUrl: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800',
            duration: '25:15',
            uploadDate: '3 days ago',
            videoId: 'dQw4w9WgXcQ',
            category: 'TV Show',
            views: 200000
          },
          {
            _id: '4',
            id: '4',
            title: 'Basketball Championship Finals',
            thumbnailUrl: 'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg?auto=compress&cs=tinysrgb&w=800',
            duration: '12:20',
            uploadDate: '4 days ago',
            videoId: 'dQw4w9WgXcQ',
            category: 'Sport',
            views: 156000
          },
          {
            _id: '5',
            id: '5',
            title: 'Behind the Scenes Documentary',
            thumbnailUrl: 'https://images.pexels.com/photos/3945313/pexels-photo-3945313.jpeg?auto=compress&cs=tinysrgb&w=800',
            duration: '35:45',
            uploadDate: '5 days ago',
            videoId: 'dQw4w9WgXcQ',
            category: 'Other',
            views: 78000
          }
        ];
        setVideos(sampleVideos);
        setFilteredVideos(sampleVideos);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      setConnectionStatus('disconnected');
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh when admin makes changes
  useAutoRefresh(fetchVideos, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchVideos();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredVideos(videos);
    } else {
      setFilteredVideos(videos.filter(video => video.category === selectedCategory));
    }
  }, [selectedCategory, videos]);

  const handleVideoPress = (videoId: string) => {
    router.push(`/video/${videoId}?type=video`);
  };

  const handleCategoryFilter = (category: typeof selectedCategory) => {
    setSelectedCategory(category);
    setShowFilters(false);
  };

  const getCategoryCount = (category: typeof selectedCategory) => {
    if (category === 'All') return videos.length;
    return videos.filter(video => video.category === category).length;
  };

  if (loading && videos.length === 0) {
    return (
      <View style={styles.container}>
        <Header title="Videos" />
        <ScrollView style={styles.content}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
          <VideoCardSkeleton />
          <VideoCardSkeleton />
          <VideoCardSkeleton />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Videos" />
      
      {/* Filter Section */}
      <View style={styles.filterSection}>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color="#FFFFFF" />
          <Text style={styles.filterButtonText}>
            {selectedCategory === 'All' ? 'All Categories' : selectedCategory}
          </Text>
          <Text style={styles.filterCount}>
            ({getCategoryCount(selectedCategory)})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter Options */}
      {showFilters && (
        <View style={styles.filterOptions}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.categoryChipActive
                ]}
                onPress={() => handleCategoryFilter(category)}
              >
                <Text style={[
                  styles.categoryChipText,
                  selectedCategory === category && styles.categoryChipTextActive
                ]}>
                  {category}
                </Text>
                <Text style={[
                  styles.categoryChipCount,
                  selectedCategory === category && styles.categoryChipCountActive
                ]}>
                  ({getCategoryCount(category)})
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
        
        {/* Category Header */}
        <View style={styles.categoryHeader}>
          <VideoIcon size={24} color="#FFFFFF" />
          <Text style={styles.categoryTitle}>
            {selectedCategory === 'All' 
              ? 'All Videos' 
              : `${selectedCategory} Videos`
            }
          </Text>
          <Text style={styles.categorySubtitle}>
            {filteredVideos.length} video{filteredVideos.length !== 1 ? 's' : ''} available
          </Text>
        </View>

        <View style={styles.videosList}>
          {filteredVideos.length > 0 ? (
            filteredVideos.map((video) => (
              <View key={video.id} style={styles.videoCardContainer}>
                <VideoCard
                  video={{
                    id: video.id || '',
                    title: video.title,
                    thumbnailUrl: video.thumbnailUrl,
                    duration: video.duration,
                    uploadDate: video.uploadDate,
                    videoId: video.videoId,
                    category: video.category
                  }}
                  onPress={() => handleVideoPress(video.id || '')}
                />
                <View style={styles.videoMeta}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{video.category}</Text>
                  </View>
                  {video.views && (
                    <Text style={styles.viewCount}>
                      {video.views.toLocaleString()} views
                    </Text>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <VideoIcon size={64} color="#6D28D9" />
              <Text style={styles.emptyText}>
                {selectedCategory === 'All' 
                  ? 'No videos available' 
                  : `No ${selectedCategory} videos found`
                }
              </Text>
              <Text style={styles.emptySubtext}>
                {selectedCategory === 'All' 
                  ? 'Check back later for new content!' 
                  : 'Try selecting a different category or check back later.'
                }
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
  filterCount: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
  },
  filterOptions: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  categoryChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  categoryChipActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#1E293B',
  },
  categoryChipText: {
    color: '#1F2937',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#0F172A',
    fontWeight: '600',
  },
  categoryChipCount: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '400',
  },
  categoryChipCountActive: {
    color: '#0F172A',
    fontWeight: '500',
  },
  categoryHeader: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 20,
    fontFamily: 'Sportypo',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 4,
  },
  categorySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    opacity: 0.8,
  },
  videosList: {
    paddingTop: 8,
    paddingBottom: 32,
  },
  videoCardContainer: {
    marginBottom: 16,
  },
  videoMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  categoryBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryBadgeText: {
    color: '#6D28D9',
    fontSize: 12,
    fontWeight: '600',
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
    lineHeight: 20,
  },
});