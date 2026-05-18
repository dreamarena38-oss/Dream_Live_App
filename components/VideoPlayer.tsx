import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';

interface VideoPlayerProps {
  videoId: string;
  autoplay?: boolean;
  height?: number;
}

export default function VideoPlayer({ videoId, autoplay = false, height = 200 }: VideoPlayerProps) {
  const [playing, setPlaying] = useState(autoplay);
  const screenWidth = Dimensions.get('window').width;

  return (
    <View style={[styles.container, { height }]}>
      <YoutubePlayer
        height={height}
        width={screenWidth - 32}
        play={playing}
        videoId={videoId}
        onChangeState={(state: string) => {
          if (state === 'ended') {
            setPlaying(false);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 16,
  },
});