/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

const UpdateData = async (taskData) => {
    console.log(taskData);
}

AppRegistry.registerComponent('UpdateData', () => UpdateData);
AppRegistry.registerComponent(appName, () => App);
