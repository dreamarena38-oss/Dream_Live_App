import React, { useState, useEffect } from 'react';
import Toast from 'react-native-toast-message';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Star, Video, Save } from 'lucide-react-native';
import Header from '@/components/Header';
import VideoPlayer from '@/components/VideoPlayer';
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates';
import apiClient from '@/lib/api';

interface FeaturedContent {
  id: string;
  type: 'video';
  videoId: string;
  title: string;
  active: boolean;
}

export default function AdminFeaturedScreen() {
  const { triggerUpdate } = useRealTimeUpdates();
  const [featuredContent, setFeaturedContent] = useState<FeaturedContent | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [title, setTitle] = useState('');
  const [previewVideoId, setPreviewVideoId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedContent();
  }, []);

  const fetchFeaturedContent = async () => {
    try {
      const response = await apiClient.getFeaturedVideo();
      if (response.data) {
        setFeaturedContent({
          id: '1',
          type: 'video',
          videoId: response.data.videoId,
          title: response.data.title,
          active: true
        });
        setTitle(response.data.title);
        setPreviewVideoId(response.data.videoId);
      }
    } catch (error) {
      console.error('Error fetching featured content:', error);
    } finally {
      setLoading(false);
    }
  };

  const extractVideoId = (url: string): string => {
    if (!url) return '';

    // Support multiple YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
      /(?:youtu\.be\/)([^&\n?#]+)/,
      /(?:youtube\.com\/embed\/)([^&\n?#]+)/,
      /(?:youtube\.com\/v\/)([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return '';
  };

  const handlePreview = () => {
    const videoId = extractVideoId(youtubeUrl);
    if (videoId) {
      setPreviewVideoId(videoId);
    } else {
      Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Please enter a valid YouTube URL'
        });
    }
  };

  const handleSave = async () => {
    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Please enter a valid YouTube URL'
        });
      return;
    }

    try {
      const response = await apiClient.updateFeaturedVideo({
        videoId,
        title: title || 'Featured Content'
      });

      if (response.data) {
        await fetchFeaturedContent();

        // Trigger real-time update
        triggerUpdate({
          type: 'featured',
          action: 'update',
          data: { videoId, title },
          timestamp: Date.now()
        });

        setYoutubeUrl('');
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Featured content updated successfully!'
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response.error || 'Failed to update featured content'
        });
      }
    } catch (error) {
      console.error('Error saving featured content:', error);
      Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to update featured content'
        });
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Featured Content" showBackButton />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Header title="Featured Content" showBackButton />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Current Featured Content */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Star size={24} color="#F59E0B" />
            <Text style={styles.sectionTitle}>Current Featured Video</Text>
          </View>

          {featuredContent && (
            <View style={styles.currentFeatured}>
              <VideoPlayer videoId={featuredContent.videoId} height={200} />
              <Text style={styles.currentTitle}>{featuredContent.title}</Text>
            </View>
          )}
        </View>

        {/* Update Featured Content */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Video size={24} color="#38BDF8" />
            <Text style={styles.sectionTitle}>Update Featured Content</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Video Title</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter video title"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>YouTube URL</Text>
              <TextInput
                style={styles.input}
                value={youtubeUrl}
                onChangeText={setYoutubeUrl}
                placeholder="https://www.youtube.com/watch?v=..."
                autoCapitalize="none"
              />
              <Text style={styles.helpText}>
                Paste the full YouTube URL here
              </Text>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.previewButton]}
                onPress={handlePreview}
              >
                <Video size={20} color="#38BDF8" />
                <Text style={styles.previewButtonText}>Preview Video</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Preview */}
        {previewVideoId && previewVideoId !== featuredContent?.videoId && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preview</Text>
            <VideoPlayer videoId={previewVideoId} height={200} />
            <Text style={styles.previewTitle}>{title || 'Preview Video'}</Text>
          </View>
        )}

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          <View style={styles.instructions}>
            <Text style={styles.instructionItem}>
              • The featured video will be displayed on the home screen
            </Text>
            <Text style={styles.instructionItem}>
              • It will autoplay when users visit the home screen
            </Text>
            <Text style={styles.instructionItem}>
              • Changes will be reflected immediately across all user devices
            </Text>
            <Text style={styles.instructionItem}>
              • Make sure to use high-quality, engaging content
            </Text>
            <Text style={styles.instructionItem}>
              • The video should be relevant to current matches or highlights
            </Text>
          </View>
        </View>
        {/* Save Button */}
        <TouchableOpacity
          style={styles.bottomSaveButton}
          onPress={handleSave}
        >
          <Save size={20} color="#FFFFFF" />
          <Text style={styles.bottomSaveButtonText}>Save & Update</Text>
        </TouchableOpacity>
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
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
    color: '#94A3B8',
  },
  section: {
    backgroundColor: '#1E293B',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Sportypo',
    color: '#F8FAFC',
  },
  currentFeatured: {
    alignItems: 'center',
  },
  currentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
    marginTop: 12,
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Sportypo',
    color: '#F8FAFC',
  },
  input: {
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#1E293B',
  },
  helpText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  previewButton: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#0F172A',
  },
  previewButtonText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#0F172A',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  previewTitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  instructions: {
    gap: 8,
  },
  instructionItem: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
  },
  bottomSaveButton: {
    backgroundColor: '#0F172A',
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 20,
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  bottomSaveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});