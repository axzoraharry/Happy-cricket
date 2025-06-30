/**
 * Happy Cricket Mobile App
 * https://happycricket.com
 *
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';

// Configure global error handling
if (__DEV__) {
  import('./src/utils/ReactotronConfig').then(() => console.log('Reactotron Configured'));
}

// Register the main application component
AppRegistry.registerComponent(appName, () => App);