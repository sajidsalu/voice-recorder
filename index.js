/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';

import {name as appName} from './app.json';
import VideoRecorder from './src/videorecorder';
import RecorderPlayer from './src/recorder-player';
import Recorder from './App';

AppRegistry.registerComponent(appName, () => VideoRecorder);
