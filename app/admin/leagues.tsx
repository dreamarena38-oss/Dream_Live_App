import React, { useState, useEffect } from 'react';
import Toast from 'react-native-toast-message';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert, Modal, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, CreditCard as Edit, Trash2, Trophy, Camera } from 'lucide-react-native';
import Header from '@/components/Header';
import LeagueCardSkeleton from '@/components/LeagueCardSkeleton';
import ConfirmationModal from '@/components/ConfirmationModal';
import * as ImagePicker from 'expo-image-picker';
import apiClient from '@/lib/api';

interface League {
  id: string;
  name: string;
  season: string;
  logoUrl?: string;
  matchCount: number;
}

export default function AdminLeaguesScreen() {
  const insets = useSafeAreaInsets();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLeague, setEditingLeague] = useState<League | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [leagueToDelete, setLeagueToDelete] = useState<League | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    season: '',
    logoUrl: ''
  });

  useEffect(() => {
    fetchLeagues();
  }, []);

  const fetchLeagues = async () => {
    try {
      const response = await apiClient.getLeagues();
      if (response.data) {
        const formattedLeagues = response.data.map((league: any) => ({
          ...league,
          id: league._id || league.id
        }));
        setLeagues(formattedLeagues);
      } else {
        Toast.show({ type: 'error', text1: 'Connection Error', text2: 'Unable to fetch leagues.' });
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Network Error', text2: 'Failed to connect to the server.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      let response;

      if (editingLeague) {
        response = await apiClient.updateLeague(editingLeague.id, formData);
      } else {
        response = await apiClient.createLeague(formData);
      }

      if (response.data) {
        fetchLeagues();
        resetForm();
        setShowModal(false);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: `League ${editingLeague ? 'updated' : 'created'} successfully!`
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response.error || 'Failed to save league'
        });
      }
    } catch (error) {
      console.error('Error saving league:', error);
      Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to save league'
        });
    }
  };

  const confirmDelete = (league: League) => {
    setLeagueToDelete(league);
    setDeleteModalVisible(true);
  };

  const executeDelete = async () => {
    if (!leagueToDelete) return;
    setDeleting(true);
    try {
      const response = await apiClient.deleteLeague(leagueToDelete.id);
      if (response.status === 200 || response.data) {
        await fetchLeagues();
        Toast.show({ type: 'success', text1: 'Success', text2: 'League deleted successfully!' });
      } else {
        Toast.show({ type: 'error', text1: 'Delete Failed', text2: response.error || 'Failed to delete league.' });
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Network Error', text2: 'Failed to delete league. Check your connection.' });
    } finally {
      setDeleting(false);
      setDeleteModalVisible(false);
      setLeagueToDelete(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      season: '',
      logoUrl: ''
    });
    setEditingLeague(null);
  };

  const handleEdit = (league: League) => {
    setEditingLeague(league);
    setFormData({
      name: league.name,
      season: league.season,
      logoUrl: league.logoUrl || ''
    });
    setShowModal(true);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setFormData({ ...formData, logoUrl: result.assets[0].uri });
    }
  };

  const LeagueCard = ({ league }: { league: League }) => (
    <View style={styles.leagueCard}>
      <View style={styles.leagueHeader}>
        {league.logoUrl ? (
          <Image source={{ uri: league.logoUrl }} style={styles.logo} />
        ) : (
          <View style={styles.logoPlaceholder}>
            <Trophy size={32} color="#38BDF8" />
          </View>
        )}
        <View style={styles.leagueInfo}>
          <Text style={styles.leagueName}>{league.name}</Text>
          <Text style={styles.leagueSeason}>{league.season}</Text>
          <Text style={styles.matchCount}>{league.matchCount} matches</Text>
        </View>
      </View>

      <View style={styles.leagueActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEdit(league)}
        >
          <Edit size={16} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => confirmDelete(league)}
        >
          <Trash2 size={16} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && leagues.length === 0) {
    return (
      <View style={styles.container}>
        <Header title="Manage Leagues" showBackButton />
        <ScrollView style={{ flex: 1 }}>
          <LeagueCardSkeleton />
          <LeagueCardSkeleton />
          <LeagueCardSkeleton />
        </ScrollView>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Header title="Manage Leagues" showBackButton />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add League</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 24 }}>
        {leagues.length > 0 ? (
          leagues.map((league) => (
            <LeagueCard key={league.id} league={league} />
          ))
        ) : (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Trophy size={48} color="#475569" />
            <Text style={{ color: '#6B7280', fontSize: 16, marginTop: 16, textAlign: 'center' }}>No leagues yet. Add your first league!</Text>
          </View>
        )}
      </ScrollView>

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={[styles.modalHeader, { paddingTop: Math.max(insets.top, 16) }]}>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.cancelButton}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingLeague ? 'Edit League' : 'Add League'}
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
              <Text style={styles.label}>League Name</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Enter league name"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Season</Text>
              <TextInput
                style={styles.input}
                value={formData.season}
                onChangeText={(text) => setFormData({ ...formData, season: text })}
                placeholder="e.g., 2024-25"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>League Logo</Text>
              <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                <Camera size={20} color="#38BDF8" />
                <Text style={styles.imageButtonText}>
                  {formData.logoUrl ? 'Change Logo' : 'Select Logo'}
                </Text>
              </TouchableOpacity>
              {formData.logoUrl && (
                <Image source={{ uri: formData.logoUrl }} style={styles.previewImage} />
              )}
            </View>

            <TouchableOpacity style={styles.bottomSaveButton} onPress={handleSave}>
              <Text style={styles.bottomSaveButtonText}>Save League</Text>
            </TouchableOpacity>
            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
      <ConfirmationModal
        visible={deleteModalVisible}
        title="Delete League"
        message={`Are you sure you want to delete "${leagueToDelete?.name}"?\n\nThis action cannot be undone.`}
        onCancel={() => { setDeleteModalVisible(false); setLeagueToDelete(null); }}
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
    borderBottomColor: '#E5E7EB',
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
  leagueCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#0F172A',
  },
  leagueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
  leagueInfo: {
    flex: 1,
  },
  leagueName: {
    fontSize: 18,
    fontFamily: 'Sportypo',
    color: '#1F2937',
    marginBottom: 4,
  },
  leagueSeason: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  matchCount: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  leagueActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  editButton: {
    backgroundColor: '#FFFFFF',
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
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
  saveButton: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalContentContainer: {
    paddingBottom: 40,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Sportypo',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0F172A',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 20,
    gap: 8,
  },
  imageButtonText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '600',
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginTop: 8,
    alignSelf: 'center',
    resizeMode: 'cover',
  },
  bottomSaveButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  bottomSaveButtonText: {
    color: '#1F2937',
    fontSize: 18,
    fontWeight: 'bold',
  },
});