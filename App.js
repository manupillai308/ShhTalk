import React from 'react';
import {createAppContainer, createSwitchNavigator} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import {setNavigator} from './src/navigationRef';
import ChatsScreen from './src/screens/ChatsScreen';
import CreateChat from './src/screens/CreateChat';
import ChatDetail from './src/screens/ChatDetail';
import InitScreen from './src/screens/InitScreen';
import {Provider as DataProvider} from './src/contexts/DataContext';
import {Provider as ServerDataProvider} from './src/contexts/ServerDataContext';
import {Provider as ClientDataProvider} from './src/contexts/ClientDataContext';
import {Provider as OnlineProvider} from './src/contexts/OnlineClientContext';
import FlashMessage from "react-native-flash-message";
import CreateChatOnline from './src/screens/CreateChatOnline';


const mainFlow = createStackNavigator({
  Chats: ChatsScreen,
  Room: CreateChat,
  OnlineRoom: CreateChatOnline,
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
                <OnlineProvider>
                  <App ref={(navigator) => { setNavigator(navigator)}}/>
                  <FlashMessage position="top" />
                </OnlineProvider>
            </ClientDataProvider>
        </ServerDataProvider>
        </DataProvider>
};
