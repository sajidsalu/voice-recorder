import React, {useState, useEffect} from 'react';
import AudioRecord, {Options} from 'react-native-audio-record';
import {View, Button, Text, Platform, FlatList} from 'react-native'; // Import necessary UI components
import {PERMISSIONS, requestMultiple} from 'react-native-permissions';
import RNFS from 'react-native-fs';

const Recorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [filePath, setFilePath] = useState(null);
  const [recordings, setRecordings] = useState([]);

  const requestRecordingPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = requestMultiple([
          PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
          PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
          PERMISSIONS.ANDROID.READ_MEDIA_AUDIO,
          PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
          PERMISSIONS.ANDROID.RECORD_AUDIO,
        ]).then(response => {
          //response is an object mapping type to permission
          console.log('permissions', response);
        });
        console.log('permissions', granted);
      } else {
        console.log('Audio recording permission requested for iOS');
      }
    } catch (err) {
      console.error('Error requesting permission:', err);
    }
  };

  useEffect(() => {
    requestRecordingPermission();
  }, []);

  const startRecording = async () => {
    try {
      const options: Options = {
        sampleRate: 16000, // Adjust sample rate as needed
        channels: 1,
        bitsPerSample: 16,
        wavFile: 'test2.wav',
        // customize other options based on requirements (e.g., audioSource, wavFile)
      };
      await AudioRecord.init(options);
      await AudioRecord.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
    }
  };

  const stopRecording = async () => {
    try {
      const audioFile = await AudioRecord.stop();
      console.log('audio file', audioFile);
      setFilePath(audioFile);
      setIsRecording(false);
      listRecordings();
    } catch (err) {
      console.error('Error stopping recording:', err);
    }
  };

  const moveFileToDownloads = async sourcePath => {
    try {
      const downloadPath = `${RNFS.DownloadDirectoryPath}/recorded_audio.wav`;
      await RNFS.moveFile(sourcePath, downloadPath);
      console.log('File moved to Downloads folder:', downloadPath);
    } catch (error) {
      console.error('Error moving file to Downloads folder:', error);
    }
  };

  const listRecordings = async () => {
    try {
      const files = await RNFS.readDir(RNFS.DocumentDirectoryPath);
      const audioFiles = files.filter(
        file => file.isFile() && file.name.endsWith('.wav'),
      );
      setRecordings(audioFiles);
    } catch (error) {
      console.error('Error listing recordings:', error);
    }
  };
  const playRecording = filePath => {
    // Implement audio playback logic here
    console.log('Playing recording:', filePath);
  };

  const renderItem = ({item}) => (
    <View style={{marginVertical: 5}}>
      <Text>{item.name}</Text>
      <Button title="Play" onPress={() => playRecording(item.path)} />
    </View>
  );

  return (
    <View>
      <Button
        title={isRecording ? 'Stop Recording' : 'Start Recording'}
        onPress={isRecording ? stopRecording : startRecording}
      />
      {filePath && <Text>Recording saved at: {filePath}</Text>}

      <FlatList
        data={recordings}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

export default Recorder;
