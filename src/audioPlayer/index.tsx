import React, {useEffect, useRef, useState} from 'react';
import {Button, StyleSheet, Text, View} from 'react-native';
import Video from 'react-native-video';

export default function AudioPlayer() {
  const audioURL =
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
  const [paused, setPaused] = useState(false);

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const playerRef = useRef<Video>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const onProgress = (data: {currentTime: number}) => {
    setCurrentTime(data.currentTime);
  };

  const onLoad = (data: {duration: number}) => {
    setDuration(data.duration);
  };
  const playLink = () => {
    setPaused(false);
  };

  const pauseLink = () => {
    setPaused(true);
  };

  const stopPlaying = () => {
    setPaused(true);
    setCurrentTime(0);
    playerRef?.current?.seek(0);
  };
  useEffect(() => {
    setPaused(true);
  }, []);

  return (
    <View style={styles.localPlayerContainer}>
      <Text>stream audio</Text>
      {paused ? (
        <Button title="Play audio" onPress={playLink} />
      ) : (
        <Button title="pause audio" onPress={pauseLink} />
      )}
      <Button title="stop audio" onPress={stopPlaying} />
      <Text style={styles.progressText}>
        {formatTime(currentTime)} / {formatTime(duration)}
      </Text>
      <Video
        ref={playerRef}
        source={{uri: audioURL}}
        paused={paused}
        ignoreSilentSwitch={'ignore'}
        onLoad={onLoad}
        onProgress={onProgress}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'column-reverse',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    padding: 30,
  },
  timer: {
    justifyContent: 'center',
    textAlign: 'center',
  },
  localPlayerContainer: {
    marginVertical: 5,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  progressText: {
    color: 'white',
    fontSize: 14,
    alignItems: 'center',
  },
});
