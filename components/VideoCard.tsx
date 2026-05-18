import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Play, Clock } from 'lucide-react-native';
import { ApiClient } from '@/lib/api';
import { Video } from '@/types';

interface VideoCardProps {
  video: Video;
  onPress: () => void;
}

export default function VideoCard({ video, onPress }: VideoCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.thumbnailContainer}>
        <Image 
          source={{ uri: ApiClient.optimizeImage(video.thumbnailUrl, 600) }} 
          style={styles.thumbnail} 
          contentFit="cover"
          transition={200}
        />
        <View style={styles.playOverlay}>
          <View style={styles.playIcon}>
            <Play size={32} color="#FFFFFF" fill="#FFFFFF" />
          </View>
        </View>
        {video.duration && (
          <View style={styles.duration}>
            <Text style={styles.durationText}>{video.duration}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{video.title}</Text>
        <View style={styles.footer}>
          <Clock size={14} color="#94A3B8" />
          <Text style={styles.uploadDate}>{video.uploadDate}</Text>
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
  thumbnailContainer: {
    position: 'relative',
    aspectRatio: 16 / 9,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    backgroundColor: 'rgba(109, 40, 217, 0.8)',
    borderRadius: 20,
    padding: 8,
    transform: [{ translateX: -16 }, { translateY: -16 }],
  },
  duration: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Sportypo',
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  uploadDate: {
    fontSize: 12,
    color: '#6B7280',
  },
});