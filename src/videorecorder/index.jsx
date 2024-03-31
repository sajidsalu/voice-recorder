/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect} from 'react';
import {StyleSheet, View, Button, Text, FlatList} from 'react-native';
import {Buffer} from 'buffer';
import Permissions from 'react-native-permissions';
import Video from 'react-native-video';
import AudioRecord from 'react-native-audio-record';
import AsyncStorage from '@react-native-async-storage/async-storage';

import RNFS from 'react-native-fs';
import VideoPlayer from '../videoPlayer';
import AudioPlayer from '../audioPlayer';

const VideoRecorder = () => {
  const [audioFile, setAudioFile] = useState('');
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(true);
  const [loaded, setLoaded] = useState(false);

  const [recordings, setRecordings] = useState([]);
  const [timer, setTimer] = useState(0);
  const [playingIndex, setPlayingIndex] = useState(-1);

  const [playVideo, setPlayVideo] = useState(false);

  const player = React.createRef(null);
  console.log('loaded--', loaded);

  useEffect(() => {
    const checkPermission = async () => {
      const p = await Permissions.check('microphone');
      console.log('permission check', p);
      if (p === 'authorized') {
        return;
      }
      await requestPermission();
    };

    const requestPermission = async () => {
      const p = await Permissions.request('microphone');
      console.log('permission request', p);
    };

    const options = {
      sampleRate: 16000,
      channels: 1,
      bitsPerSample: 16,
      wavFile: 'test2.wav',
    };
    const handleData = data => {
      const chunk = Buffer.from(data, 'base64');
      console.log('chunk size', chunk.byteLength);
    };
    AudioRecord.init(options);
    AudioRecord.on('data', handleData);
    checkPermission();
  }, []);

  useEffect(() => {
    let interval;
    if (recording) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [recording]);
  const start = () => {
    setTimer(0);
    console.log('start record');
    setRecording(true);
    AudioRecord.start();
  };

  const stop = async () => {
    if (!recording) {
      return;
    }
    console.log('stop record');
    let audioFilePath = await AudioRecord.stop();
    console.log('audioFilePath', audioFilePath);

    const timestamp = new Date().getTime(); // Get current timestamp
    const destinationPath = `${RNFS.DownloadDirectoryPath}/recorded_audio_${timestamp}.wav`;

    try {
      await RNFS.moveFile(audioFilePath, destinationPath);
      console.log('File saved to:', destinationPath);
      setRecordings([...recordings, {path: destinationPath}]);

      // Store the file path in AsyncStorage for persistence
      await AsyncStorage.setItem(
        'recordings',
        JSON.stringify([...recordings, {path: destinationPath}]),
      );
    } catch (error) {
      console.error('Error moving file:', error);
    }
    setRecording(false);
  };

  const play = () => {
    if (player.current) {
      if (!loaded) {
        setLoaded(true); // Set loaded to true to indicate that the video is loaded
      }
      setPaused(false);
      player.current.play(); // Call play method on player.current
    }
  };

  const pause = () => {
    setPaused(true);
  };

  const onLoad = data => {
    console.log('onLoad', data);
  };

  const onProgress = data => {
    console.log('progress', data);
  };

  const onEnd = () => {
    console.log('finished playback');
    setPaused(true);
    setLoaded(false);
  };

  const onError = error => {
    console.log('error', error);
  };

  const playRecording = (filePath, index) => {
    console.log('Playing recording:', filePath);
    setAudioFile(filePath); // Set the audio file path to play
    setPaused(false); // Play the audio
    setPlayingIndex(index);
  };
  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const renderItem = ({item, index}) => (
    <View style={{marginVertical: 5, flex: 1, flexDirection: 'row', gap: 10}}>
      <Text>{item.path}</Text>
      <Button
        title={playingIndex === index && !paused ? 'Pause' : 'Play'}
        onPress={() => {
          if (playingIndex === index && !paused) {
            pause();
          } else {
            playRecording(item.path, index);
          }
        }}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {!recording ? (
          <Button onPress={start} title="Record" />
        ) : (
          <Button onPress={stop} title="Stop" />
        )}
      </View>
      {recording && (
        <Text style={styles.timer}>Recording: {formatTime(timer)}</Text>
      )}
      {audioFile ? (
        <Video
          ref={player}
          source={{uri: audioFile}}
          paused={paused}
          ignoreSilentSwitch={'ignore'}
          onLoad={onLoad}
          onProgress={onProgress}
          onEnd={onEnd}
          onError={onError}
        />
      ) : null}

      <FlatList
        style={{flex: 1, backgroundColor: '#232323'}}
        data={recordings}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
      />
      <View style={styles.localPlayerContainer}>
        <Text>stream video</Text>
        <Button title="Play video" onPress={() => setPlayVideo(true)} />
      </View>
      <AudioPlayer />

      <VideoPlayer
        modalVisible={playVideo}
        closeModal={() => setPlayVideo(false)}
      />
    </View>
  );
};

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
});

export default VideoRecorder;
