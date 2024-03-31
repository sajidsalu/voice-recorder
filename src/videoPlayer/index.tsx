import {View, Modal, StyleSheet, Button, Text} from 'react-native';
import React, {useRef, useState} from 'react';
import Video from 'react-native-video';

export default function VideoPlayer({
  modalVisible,
  closeModal,
}: {
  modalVisible: boolean;
  closeModal: () => void;
}) {
  const [pause, setPaused] = useState(false);
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

  const stop = () => {
    setPaused(true);
    setCurrentTime(0);
    playerRef?.current?.seek(0);
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={modalVisible}
      onRequestClose={() => {
        closeModal();
      }}>
      <View style={styles.modalContainer}>
        <Video
          source={{
            uri: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          }}
          ref={playerRef}
          paused={pause}
          style={styles.videoPlayer}
          resizeMode="contain"
          onLoad={onLoad}
          onProgress={onProgress}
        />
        <View style={styles.controlContainer}>
          <Text style={styles.progressText}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </Text>
          {pause ? (
            <Button title="Resume" onPress={() => setPaused(false)} />
          ) : (
            <Button title="Pause" onPress={() => setPaused(true)} />
          )}
          <Button title="Stop" onPress={stop} />
          <Button title="Close" onPress={closeModal} />
        </View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  videoPlayer: {
    width: '100%',
    aspectRatio: 16 / 9, // Adjust aspect ratio as needed
  },
  progressText: {
    color: 'white',
    fontSize: 14,
    alignItems: 'center',
  },
  controlContainer: {
    flexDirection: 'row',
    gap: 20,
    padding: 10,
    alignItems: 'center',
  },
});
