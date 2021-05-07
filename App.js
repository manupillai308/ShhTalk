import React from 'react';
import {Alert} from 'react-native';
import {createAppContainer, NavigationActions} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import {navigate, setNavigator} from './src/navigationRef';
import ChatsScreen from './src/screens/ChatsScreen';
import CreateChat from './src/components/CreateChat';
import ChatDetail from './src/screens/ChatDetail';
import {Provider as DataProvider} from './src/contexts/DataContext';
import {Provider as ServerDataProvider} from './src/contexts/ServerDataContext';
import {Provider as ClientDataProvider} from './src/contexts/ClientDataContext';
import FlashMessage from "react-native-flash-message";


const navigator = createStackNavigator({
  Chats: ChatsScreen,
  Room: CreateChat,
  ChatDetail,
},{
  initialRouteName:'Chats'
});

// const defaultGetStateForAction = navigator.router.getStateForAction;

// navigator.router.getStateForAction = (action, state) => {
//   if(
//     state && 
//     action.type === NavigationActions.BACK &&
//     state.routes[state.index].params.needsConfirmation
//   ){
//     Alert.alert(
//       'Leave Room?',
//       'You are about to close and leave the room. Do you want to proceed?',
//       [
//         { text: "Don't Leave", style: 'cancel', onPress: () => {} },
//         {
//           text: 'Go Ahead',
//           style: 'destructive',
//           onPress: () => {
//             state.routes[state.index].params.needsConfirmation = false;
//             const {routes} = defaultGetStateForAction(action, state);
//             navigate(routes[0].routeName);
//           },
//         },
//       ]
//     );
//     return null;
//   }

//   return defaultGetStateForAction(action, state);
// };

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
