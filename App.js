import React from 'react';
import {createAppContainer, createSwitchNavigator} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import {setNavigator} from './src/navigationRef';
import ChatsScreen from './src/screens/ChatsScreen';
import CreateChat from './src/components/CreateChat';
import ChatDetail from './src/screens/ChatDetail';
import InitScreen from './src/screens/InitScreen';
import {Provider as DataProvider} from './src/contexts/DataContext';
import {Provider as ServerDataProvider} from './src/contexts/ServerDataContext';
import {Provider as ClientDataProvider} from './src/contexts/ClientDataContext';
import FlashMessage from "react-native-flash-message";


const mainFlow = createStackNavigator({
  Chats: ChatsScreen,
  Room: CreateChat,
  ChatDetail,
},{
  initialRouteName:'Chats'
});

const navigator = createSwitchNavigator({
  Init: InitScreen,
  mainFlow,
});


const App = createAppContainer(navigator);

export default (props) => {
    return <DataProvider>
        <ServerDataProvider>
            <ClientDataProvider>
                <App ref={(navigator) => { setNavigator(navigator)}}/>
                <FlashMessage position="top" />
            </ClientDataProvider>
        </ServerDataProvider>
        </DataProvider>
};
