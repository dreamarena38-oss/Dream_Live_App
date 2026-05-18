import React, { useState, useEffect } from 'react';
import Toast from 'react-native-toast-message';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert, Modal, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, CreditCard as Edit, Trash2, Star, Trophy, Check, X, Play } from 'lucide-react-native';
import Header from '@/components/Header';
import VideoCard from '@/components/VideoCard';
import VideoCardSkeleton from '@/components/VideoCardSkeleton';
import ConfirmationModal from '@/components/ConfirmationModal';
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates';
import { useRouter } from 'expo-router';
import apiClient from '@/lib/api';

interface Highlight {
  _id: string;
  id: string;
  title: string;
  youtubeUrl: string;
  videoId: string;
  thumbnailUrl: string;
  duration?: string;
  category: string;
  sport: string;
  featured: boolean;
  uploadDate: string;
  views?: number;
}

export default function AdminHighlightsScreen() {
  const router = useRouter();
  const { triggerUpdate } = useRealTimeUpdates();
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingHighlight, setEditingHighlight] = useState<Highlight | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [highlightToDelete, setHighlightToDelete] = useState<Highlight | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    youtubeUrl: '',
    sport: 'Football',
    featured: false
  });
  const [formErrors, setFormErrors] = useState({
    title: '',
    youtubeUrl: ''
  });

  const sportOptions = ['Football', 'Basketball', 'Soccer', 'Tennis', 'Baseball', 'Hockey', 'Golf', 'Boxing'];

  useEffect(() => {
    fetchHighlights();
  }, []);

  const fetchHighlights = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getHighlights();
      if (response.data) {
        const formattedHighlights = response.data.map(highlight => ({
          ...highlight,
          id: highlight._id || highlight.id,
          _id: highlight._id || highlight.id
        }));
        setHighlights(formattedHighlights);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Connection Error',
          text2: `Failed to fetch highlights: ${response.error}`
        });
      }
    } catch (error) {
      Toast.show({
          type: 'error',
          text1: 'Network Error',
          text2: 'Unable to connect to the server.'
        });
    } finally {
      setLoading(false);
    }
  };

  const extractVideoId = (url: string): string => {
    if (!url) return '';

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

  const generateThumbnail = (videoId: string): string => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  const validateForm = (): boolean => {
    const errors = { title: '', youtubeUrl: '' };
    let isValid = true;

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
      isValid = false;
    } else if (formData.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters';
      isValid = false;
    }

    if (!formData.youtubeUrl.trim()) {
      errors.youtubeUrl = 'YouTube URL is required';
      isValid = false;
    } else {
      const videoId = extractVideoId(formData.youtubeUrl);
      if (!videoId) {
        errors.youtubeUrl = 'Invalid YouTube URL format';
        isValid = false;
      }
    }

    setFormErrors(errors);
    return isValid;
  };

  const resetForm = () => {
    setFormData({
      title: '',
      youtubeUrl: '',
      sport: 'Football',
      featured: false
    });
    setFormErrors({ title: '', youtubeUrl: '' });
    setEditingHighlight(null);
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Toast.show({
          type: 'error',
          text1: 'Validation Error',
          text2: 'Please fix the errors below and try again.'
        });
      return;
    }

    setSaving(true);

    try {
      const videoId = extractVideoId(formData.youtubeUrl);

      const highlightData = {
        title: formData.title.trim(),
        youtubeUrl: formData.youtubeUrl.trim(),
        videoId,
        thumbnailUrl: generateThumbnail(videoId),
        category: 'Sports',
        sport: formData.sport,
        featured: formData.featured
      };

      let response;

      if (editingHighlight) {
        response = await apiClient.updateHighlight(editingHighlight._id, highlightData);
      } else {
        response = await apiClient.createHighlight(highlightData);
      }

      if (response.data) {
        await fetchHighlights();

        triggerUpdate({
          type: 'video',
          action: editingHighlight ? 'update' : 'create',
          data: response.data,
          timestamp: Date.now()
        });

        resetForm();
        setShowModal(false);

        Toast.show({
          type: 'success',
          text1: 'Success!',
          text2: `Highlight "${highlightData.title}" has been ${editingHighlight ? 'updated' : 'added'} successfully!`
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Save Failed',
          text2: response.error || `Failed to save highlight.`
        });
      }
    } catch (error) {
      Toast.show({
          type: 'error',
          text1: 'Network Error',
          text2: 'Unable to save highlight. Please check your connection.'
        });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (highlight: Highlight) => {
    setHighlightToDelete(highlight);
    setDeleteModalVisible(true);
  };

  const executeDelete = async () => {
    if (!highlightToDelete) return;
    setDeleting(true);
    try {
      const response = await apiClient.deleteHighlight(highlightToDelete._id);
      if (response.status === 200 || response.data) {
        await fetchHighlights();
        triggerUpdate({ type: 'video', action: 'delete', data: { id: highlightToDelete._id }, timestamp: Date.now() });
        Toast.show({ type: 'success', text1: 'Success', text2: 'Highlight deleted successfully!' });
      } else {
        Toast.show({ type: 'error', text1: 'Delete Failed', text2: response.error || 'Failed to delete highlight.' });
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Network Error', text2: 'Failed to delete highlight. Check your connection.' });
    } finally {
      setDeleting(false);
      setDeleteModalVisible(false);
      setHighlightToDelete(null);
    }
  };

  const handleEdit = (highlight: Highlight) => {
    setEditingHighlight(highlight);
    setFormData({
      title: highlight.title,
      youtubeUrl: highlight.youtubeUrl,
      sport: highlight.sport,
      featured: highlight.featured
    });
    setFormErrors({ title: '', youtubeUrl: '' });
    setShowModal(true);
  };

  const AdminHighlightCard = ({ highlight }: { highlight: Highlight }) => (
    <View style={styles.highlightCard}>
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
        onPress={() => router.push(`/video/${highlight.id || ''}?type=highlight`)}
      />
      <View style={styles.highlightMeta}>
        <View style={styles.metaRow}>
          <Text style={styles.sportTag}>{highlight.sport}</Text>
          {highlight.featured && (
            <View style={styles.featuredBadge}>
              <Star size={14} color="#FFD700" fill="#FFD700" />
              <Text style={styles.featuredText}>Featured</Text>
            </View>
          )}
        </View>
        <View style={styles.highlightActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEdit(highlight)}
          >
            <Edit size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => confirmDelete(highlight)}
          >
            <Trash2 size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading && highlights.length === 0) {
    return (
      <View style={styles.container}>
        <Header title="Manage Highlights" showBackButton />
        <ScrollView style={{ flex: 1 }}>
          <VideoCardSkeleton />
          <VideoCardSkeleton />
          <VideoCardSkeleton />
        </ScrollView>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Header title="Manage Highlights" showBackButton />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add Highlight</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {highlights.length > 0 ? (
          highlights.map((highlight) => (
            <AdminHighlightCard key={highlight._id} highlight={highlight} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Trophy size={64} color="#475569" />
            <Text style={styles.emptyText}>No highlights found</Text>
            <Text style={styles.emptySubtext}>Add your first sports highlight to get started!</Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => {
                setShowModal(false);
                resetForm();
              }}
              style={styles.headerButton}
            >
              <X size={20} color="#94A3B8" />
              <Text style={styles.cancelButton}>Back</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>
              {editingHighlight ? 'Edit Highlight' : 'Add New Highlight'}
            </Text>

            <View style={{ width: 40 }} />
          </View>

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.modalContentContainer}
          >
            <View style={styles.formGroup}>
              <Text style={styles.label}>Highlight Title *</Text>
              <TextInput
                style={[
                  styles.input,
                  formErrors.title ? styles.inputError : null
                ]}
                value={formData.title}
                onChangeText={(text) => {
                  setFormData({ ...formData, title: text });
                  if (formErrors.title) {
                    setFormErrors({ ...formErrors, title: '' });
                  }
                }}
                placeholder="Enter highlight title"
                editable={!saving}
              />
              {formErrors.title && <Text style={styles.errorText}>{formErrors.title}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>YouTube URL *</Text>
              <TextInput
                style={[
                  styles.input,
                  formErrors.youtubeUrl ? styles.inputError : null
                ]}
                value={formData.youtubeUrl}
                onChangeText={(text) => {
                  setFormData({ ...formData, youtubeUrl: text });
                  if (formErrors.youtubeUrl) {
                    setFormErrors({ ...formErrors, youtubeUrl: '' });
                  }
                }}
                placeholder="https://www.youtube.com/watch?v=..."
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                editable={!saving}
              />
              {formErrors.youtubeUrl && <Text style={styles.errorText}>{formErrors.youtubeUrl}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Sport Category</Text>
              <View style={styles.sportButtons}>
                {sportOptions.map((sport) => (
                  <TouchableOpacity
                    key={sport}
                    style={[
                      styles.sportButton,
                      formData.sport === sport && styles.sportButtonActive
                    ]}
                    onPress={() => setFormData({ ...formData, sport })}
                    disabled={saving}
                  >
                    <Text style={[
                      styles.sportButtonText,
                      formData.sport === sport && styles.sportButtonTextActive
                    ]}>
                      {sport}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <View style={styles.switchContainer}>
                <View style={styles.switchLabel}>
                  <Star size={20} color="#FFD700" />
                  <Text style={styles.label}>Featured Highlight</Text>
                </View>
                <Switch
                  value={formData.featured}
                  onValueChange={(value) => setFormData({ ...formData, featured: value })}
                  trackColor={{ false: '#475569', true: '#6D28D9' }}
                  thumbColor={formData.featured ? '#FFFFFF' : '#F4F3F4'}
                  disabled={saving}
                />
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.bottomSaveButton, saving && { opacity: 0.7 }]} 
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.bottomSaveButtonText}>
                {saving ? 'Saving...' : 'Save Highlight'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      <ConfirmationModal
        visible={deleteModalVisible}
        title="Delete Highlight"
        message={`Are you sure you want to delete "${highlightToDelete?.title}"?\n\nThis action cannot be undone.`}
        onCancel={() => { setDeleteModalVisible(false); setHighlightToDelete(null); }}
        onConfirm={executeDelete}
        loading={deleting}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  addButton: {
    backgroundColor: '#6D28D9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 20,
    fontFamily: 'Sportypo',
    color: '#1F2937',
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  highlightCard: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  highlightMeta: {
    padding: 16,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sportTag: {
    backgroundColor: '#334155',
    color: '#6D28D9',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  featuredText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
  },
  highlightActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  editButton: {
    backgroundColor: '#334155',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: '#1F2937',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Sportypo',
    color: '#1F2937',
  },
  cancelButton: {
    color: '#6B7280',
    fontSize: 16,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalContentContainer: {
    paddingBottom: 40,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Sportypo',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  sportButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sportButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#FFFFFF',
  },
  sportButtonActive: {
    backgroundColor: '#6D28D9',
    borderColor: '#6D28D9',
  },
  sportButtonText: {
    color: '#6B7280',
    fontSize: 14,
  },
  sportButtonTextActive: {
    color: '#1F2937',
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bottomSaveButton: {
    backgroundColor: '#6D28D9',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  bottomSaveButtonText: {
    color: '#1F2937',
    fontSize: 18,
    fontWeight: 'bold',
  },
});