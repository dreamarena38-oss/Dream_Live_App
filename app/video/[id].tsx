import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Header from '@/components/Header';
import VideoPlayer from '@/components/VideoPlayer';
import { Calendar, Eye, Tag, Play } from 'lucide-react-native';
import apiClient from '@/lib/api';
import LoaderSpinner from '@/components/LoaderSpinner';

interface VideoDetails {
  id: string;
  title: string;
  description?: string;
  videoId: string;
  uploadDate: string;
  views?: number;
  category: string;
  duration?: string;
  youtubeUrl?: string;
  sport?: string;
  featured?: boolean;
  thumbnailUrl?: string;
}

export default function VideoDetailsScreen() {
  const { id, type } = useLocalSearchParams();
  const [video, setVideo] = useState<VideoDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchVideoDetails();
  }, [id]);

  const fetchVideoDetails = async () => {
    try {
      setLoading(true);
      let response;
      
      // Try specific type if provided, otherwise try video then highlight
      if (type === 'highlight') {
        response = await apiClient.getHighlight(id as string);
      } else if (type === 'video') {
        response = await apiClient.getVideo(id as string);
      } else {
        response = await apiClient.getVideo(id as string);
        if (!response.data) {
          response = await apiClient.getHighlight(id as string);
        }
      }

      if (response.data) {
        const data = response.data;
        setVideo({
          ...data,
          id: data._id || data.id,
        });
        console.log('✅ Video details loaded:', data.title);
      } else {
        console.error('Failed to fetch video details:', response.error);
      }
    } catch (error) {
      console.error('Error fetching video details:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchVideoDetails();
    setRefreshing(false);
  };

  if (loading || !video) {
    return (
      <View style={styles.container}>
        <Header title="Video" showBackButton />
        <LoaderSpinner msgText={loading ? 'Loading video...' : 'Video not found'} />
        {/* <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            {loading ? 'Loading video...' : 'Video not found'}
          </Text>
        </View> */}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Video" showBackButton />
      
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Video Player */}
        <View style={styles.videoPlayerContainer}>
          <VideoPlayer videoId={video.videoId} height={220} />
        </View>
        
        {/* Video Details */}
        <View style={styles.videoDetails}>
          <Text style={styles.title}>{video.title}</Text>
          
          <View style={styles.metadata}>
            <View style={styles.metadataItem}>
              <Calendar size={16} color="#38BDF8" />
              <Text style={styles.metadataText}>{video.uploadDate}</Text>
            </View>
            
            {video.views && (
              <View style={styles.metadataItem}>
                <Eye size={16} color="#38BDF8" />
                <Text style={styles.metadataText}>{video.views.toLocaleString()} views</Text>
              </View>
            )}

            {video.duration && (
              <View style={styles.metadataItem}>
                <Text style={styles.durationText}>{video.duration}</Text>
              </View>
            )}
          </View>

          <View style={styles.categoryContainer}>
            <View style={styles.categoryBadge}>
              <Tag size={14} color="#FFFFFF" />
              <Text style={styles.categoryText}>{video.category}</Text>
            </View>
            {video.sport && (
              <View style={[styles.categoryBadge, styles.sportBadge]}>
                <Text style={styles.categoryText}>{video.sport}</Text>
              </View>
            )}
            {video.featured && (
              <View style={[styles.categoryBadge, styles.featuredBadge]}>
                <Text style={styles.categoryText}>⭐ Featured</Text>
              </View>
            )}
          </View>
          
          {video.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionTitle}>Description</Text>
              <Text style={styles.description}>{video.description}</Text>
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
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  videoPlayerContainer: {
    backgroundColor: '#000000',
  },
  videoDetails: {
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Sportypo',
    color: '#1F2937',
    marginBottom: 16,
    lineHeight: 30,
  },
  metadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metadataText: {
    fontSize: 14,
    color: '#6B7280',
  },
  durationText: {
    fontSize: 14,
    color: '#6D28D9',
    fontWeight: '600',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  categoryBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6D28D9',
  },
  sportBadge: {
    backgroundColor: 'rgba(109, 40, 217, 0.1)',
  },
  featuredBadge: {
    backgroundColor: '#FEF3C7',
  },
  descriptionContainer: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  descriptionTitle: {
    fontSize: 16,
    fontFamily: 'Sportypo',
    color: '#1F2937',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 24,
  },
});