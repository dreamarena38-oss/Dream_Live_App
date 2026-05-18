import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
}

export default function Header({ title, showBackButton = false }: HeaderProps) {
  const router = useRouter();

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.content}>
          {showBackButton && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          <Text
            style={styles.title}
            numberOfLines={1}
          >
            {title}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#6D28D9',
  },
  header: {
    backgroundColor: '#6D28D9',
    paddingBottom: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width > 400 ? 24 : 16,
    paddingTop: 12,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  title: {
    fontSize: Platform.select({ android: 20, ios: 24 }),
    fontFamily: 'Sportypo',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 48,
    textAlign: 'center',
  },
});