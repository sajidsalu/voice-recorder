// App.js
import React, {useState} from 'react';
import {View, Text, Button, FlatList, PermissionsAndroid} from 'react-native';
import AudioRecord from 'react-native-audio-record';

const Recorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState([]);

  // Request audio recording permission
  const requestRecordingPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Audio Recording Permission',
          message: 'This app needs access to your microphone to record audio.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Audio recording permission granted');
      } else {
        console.log('Audio recording permission denied');
      }
    } catch (err) {
      console.error('Error requesting permission:', err);
    }
  };

  // Start recording
  const startRecording = async () => {
    try {
      const filePath = '/path/to/save/recording.mp3'; // Specify your desired path here
      const options = {
        sampleRate: 44100,
        channels: 2,
        bitsPerSample: 16,
        audioSource: 6,
      };
      const result = await AudioRecord.start(filePath, options);
      console.log('Recording started:', result);
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  // Stop recording
  const stopRecording = async () => {
    try {
      const filePath = await AudioRecord.stop();
      console.log('Recording stopped, file path:', filePath);
      setIsRecording(false);
      setRecordings([...recordings, {path: filePath}]);
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  // Rendered item for FlatList
  const renderItem = ({item}) => (
    <View style={{marginVertical: 5}}>
      <Text>{item.path}</Text>
      <Button title="Play" onPress={() => playRecording(item.path)} />
    </View>
  );

  // Play recorded audio
  const playRecording = filePath => {
    // Implement audio playback logic here
    console.log('Playing recording:', filePath);
  };

  return (
    <View style={{flex: 1, padding: 20}}>
      <Button
        title="Request Recording Permission"
        onPress={requestRecordingPermission}
      />
      <Button
        title={isRecording ? 'Stop Recording' : 'Start Recording'}
        onPress={isRecording ? stopRecording : startRecording}
        disabled={
          !PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO)
        }
      />
      <FlatList
        data={recordings}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

export default Recorder;
