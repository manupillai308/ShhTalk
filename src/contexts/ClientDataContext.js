import createDataContext from './createDataContext';
import { NetworkInfo } from 'react-native-network-info';
import { showMessage } from "react-native-flash-message";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {navigate} from '../navigationRef';
import { NativeEventEmitter, NativeModules } from 'react-native';
import LocalClient from '../../LocalClient';
import {getCurrentTime} from '../screens/ChatDetail';
var seedrandom = require('seedrandom');

const clientDataReducer = (state, action) => {
  switch(action.type){
    case 'send_msg':{
      // console.log("client-message(sender)", JSON.stringify({...action.payload, type:"in", user:state.username}));
      LocalClient.sendMsg(JSON.stringify({...action.payload, type:"in", user:state.username}));
      return state;
    }
    case 'unsubscribe':{
      for(let key in state.listeners){
        state.listeners[key].remove();
      }
      AsyncStorage.setItem('@client_data', JSON.stringify({...state, listeners:{}})).then().catch((error) => {
        console.log(error.message);
      });
      return {...state, listeners:{}};
    }
    case 'set_data':
      return {...action.payload, listeners: state.listeners};
    case 'message':{
      action.payload.callback(state.active_id, action.payload.data);
      return state;
    }
    case 'client_error':{
      showMessage({
        message:"Cannot Join Room",
        description:"Its seem you are not connected to the hotspot or the admin has not created the room.",
        type:"danger",
        duration: 3500,
      });
      LocalClient.stopClient();
      return {...state, active_id:'', client_open:false, username:'', server_ip:''};
    }
    case 'room_lost':{
      const data = {active_id:'', client_open:false, username:'', server_ip:''};
      AsyncStorage.setItem('@client_data', JSON.stringify({...data, listeners:{}})).then().catch((error) => {
        console.log(error.message);
      });
      LocalClient.stopClient();
      return {...state, ...data};
    }
    case 'client_start':{
      AsyncStorage.setItem('@client_data', JSON.stringify({...state, active_id:action.payload.active_id, active_title:action.payload.active_title, username:action.payload.username, listeners:{}})).then().catch((error) => {
        console.log(error.message);
      });
      return {...state, active_id:action.payload.active_id, active_title:action.payload.active_title, username:action.payload.username};
    }
    case 'connect':{
      LocalClient.startClient(action.payload.ip);
      AsyncStorage.setItem('@client_data', JSON.stringify({...state, client_open:true, server_ip:action.payload.ip, listeners:{}})).then().catch((error) => {
        console.log(error.message);
      });
      const eventEmitter = new NativeEventEmitter(NativeModules.ToastExample);
      const start = eventEmitter.addListener('client-start', (data) => {
        action.payload.clientConnect(JSON.parse(data.payload));
      });
      const error = eventEmitter.addListener('connection-error', () => {
        action.payload.clientError();
      });
      return {...state, client_open:true, server_ip:action.payload.ip, listeners:{...state.listeners, start, error}};
    }
    case 'subscribe':{
      const eventEmitter = new NativeEventEmitter(NativeModules.ToastExample);
      const message = eventEmitter.addListener('message', (data) => {
        // console.log("server-message", data.payload);
        action.payload.addData(JSON.parse(data.payload));
      })
      const roomLost = eventEmitter.addListener('room-lost', ()=>{
        const data = {id:Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5), date:getCurrentTime(), type:'system',  message: "lost", user:'Room'};
        action.payload.addData(data);
        action.payload.roomLost();
      })
      return {...state, listeners: {...state.listeners, message, roomLost}};

    }
    default:
      return state;
  }
}

const sendMsg = dispatch => (data) => {
  dispatch({type:'send_msg', payload:data})
}
const unsubscribeAll = dispatch => () => {
  // console.log("unsubscription called");
  dispatch({type:'unsubscribe'});
}

const loadConfig = dispatch => async () => {
  try{
    var data = await AsyncStorage.getItem('@client_data');
    if(data !== null) dispatch({type:'set_data', payload:JSON.parse(data)});
  }catch(e){
    console.log(e.message);
  }
}

const subscribeAll = dispatch => (callback) => {
  // console.log("subscribeAll called");
  const addData = (data) => {
      dispatch({type:'message', payload:{callback, data}})
  }

  const roomLost = () => {
    dispatch({type:'room_lost'});
    dispatch({type:'unsubscribe'});
    LocalClient.stopClient();
  }
  dispatch({type: 'subscribe', payload:{addData, roomLost}});
}


const connectClient = dispatch => async (length, createRoom) => {
  let ip = await NetworkInfo.getGatewayIPAddress();
  // console.log(ip);
  const clientConnect = (data) => {
    const active_title = data.title;
    const username =  data.user;
    const active_id = createRoom(active_title, length);
    seedrandom(username, { global: true });
    dispatch({type:'client_start', payload:{active_id, active_title, username}});
    showMessage({
      message:`Joined ${active_title}`,
      type:"success",
    });
    navigate('ChatDetail', {title:active_title, id:active_id, isChatAlive:true, isClient:true});
  }
  const clientError = () => {
    dispatch({type:'client_error'});
    dispatch({type:'unsubscribe'});
  }
  dispatch({type:'connect', payload:{ip, clientConnect, clientError}});
};


export const {Context, Provider} = createDataContext(clientDataReducer, {connectClient, subscribeAll, sendMsg, unsubscribeAll, loadConfig}, {active_id:'', client_open:false, username:'', listeners:{}, server_ip:'', active_title:''});