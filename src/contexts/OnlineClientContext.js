import createDataContext from './createDataContext';
import { showMessage } from "react-native-flash-message";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {navigate, pop} from '../navigationRef';
import { NativeEventEmitter, NativeModules } from 'react-native';
import OnlineClient from '../../OnlineClient';
import {getCurrentTime} from '../screens/ChatDetail';
var seedrandom = require('seedrandom');


const onlineClientReducer = (state, action) => {
    switch(action.type){
        case 'set_data':
            return {...action.payload, listeners: state.listeners};
        case 'room-connected':{
            state.listeners.room_connected.remove();
            state.listeners.join_error.remove();
            AsyncStorage.setItem('@online_data', JSON.stringify({...state, ...action.payload, connection:true, listeners:{}})).then().catch((error) => {
                console.log(error.message);
              });
            return {...state, ...action.payload, connection:true, listeners:{}};
        }

        case 'room-error':{
            state.listeners.room_connected.remove();
            state.listeners.join_error.remove();
            AsyncStorage.setItem('@online_data', JSON.stringify({...state, connection_error: {error:true, message: action.payload.err_msg}, listeners:{}})).then().catch((error) => {
                console.log(error.message);
              });
            OnlineClient.stopService();
            return {...state, connection_error: {error:true, message: action.payload.err_msg}, listeners:{}};
        }

        case 'connect-error':{
            state.listeners.connected.remove();
            state.listeners.connect_error.remove();
            AsyncStorage.setItem('@online_data', JSON.stringify({...state, connection_error: {error:true, message:'Connection failed to server. Please check your internet connection.'}, listeners:{}})).then().catch((error) => {
                console.log(error.message);
              });

            OnlineClient.stopService();
            return {...state, connection_error: {error:true, message:'Connection failed to server. Please check your internet connection.'}, listeners:{}};
        }
        case 'connected':{
            state.listeners.connected.remove();
            state.listeners.connect_error.remove();

            const eventEmitter = new NativeEventEmitter(NativeModules.ToastExample);
            const room_connected = eventEmitter.addListener('room-connected', (data) => {
                action.payload.roomConnectedCb(data);
            });
            const join_error = eventEmitter.addListener('join-error', (data) => {
                action.payload.roomErrorCb(data.message);
              });
            
            const {roomInfo} = action.payload;
            if(roomInfo.type == "join") OnlineClient.joinRoom(roomInfo.payload);
            else OnlineClient.createRoom(roomInfo.payload);
            AsyncStorage.setItem('@online_data', JSON.stringify({...state, listeners:{}})).then().catch((error) => {
                console.log(error.message);
              });

            return {...state, listeners:{room_connected, join_error}};
        }
        case 'connect':{
            const eventEmitter = new NativeEventEmitter(NativeModules.ToastExample);
            const connected = eventEmitter.addListener('connect', () => {
                action.payload.connectCb();
              });
            const connect_error = eventEmitter.addListener('connect-error', () => {
                action.payload.connectErrorCb();
            }); 
            OnlineClient.startService(); 
            AsyncStorage.setItem('@online_data', JSON.stringify({...state, active_id:'', connection:false, connection_error: {error:false, message:''}, username:'', listeners:{}, active_title:''})).then().catch((error) => {
                console.log(error.message);
              });

            return {...state, active_id:'', connection:false, connection_error: {error:false, message:''}, username:'', listeners:{connected, connect_error}, active_title:''};
        }
        case 'subscribe':{
            const eventEmitter = new NativeEventEmitter(NativeModules.ToastExample);
            const message = eventEmitter.addListener('message', (data) => {
                const {username, message} = data;
                action.payload.addData({...JSON.parse(message), user:username});
            });

            const disconnected = eventEmitter.addListener('disconnect', () => {
                const data = {id:Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5), date:getCurrentTime(), type:'system',  message: "lost", user:'Room'};
                action.payload.addData(data);
                action.payload.roomLost();
            });
            
            return {...state, listeners:{...state.listeners, message, disconnected}};
        }
        case 'unsubscribe':{
            for(let key in state.listeners){
                state.listeners[key].remove();
            }
            return {...state, listeners:{}};
        }
        case 'room_lost':{
            const data = {active_id:'', connection:false, connection_error: {error:false, message:''}, username:'', active_title:'', join_code:''};
            AsyncStorage.setItem('@online_data', JSON.stringify({...state, ...data, listeners:{}})).then().catch((error) => {
                console.log(error.message);
              });
            return {...state, ...data};
        }
        case 'reset':{
            if(state.connection)
                return state;
            AsyncStorage.setItem('@online_data', JSON.stringify({...state, connection:false, connection_error: {error:false, message:''}, listeners:{}})).then().catch((error) => {
                console.log(error.message);
              });
            return {...state, connection:false, connection_error: {error:false, message:''}};
        }
        default:
            return state;
    }
}

const sendMsg = () => (data) => {
    OnlineClient.sendMsg({message:JSON.stringify({...data, type:"in"})});
}

const unsubscribeAll = dispatch => () => {
    dispatch({type:'unsubscribe'});
}
  
const loadConfig = dispatch => async () => {
    try{
      var data = await AsyncStorage.getItem('@online_data');
      if(data !== null) dispatch({type:'set_data', payload:JSON.parse(data)});
    }catch(e){
      console.log(e.message);
    }
}

const subscribeAll = dispatch => (id, callback) => {
    const addData = (data) => {
        callback(id, data);
    }
  
    const roomLost = () => {
      dispatch({type:'room_lost'});
      dispatch({type:'unsubscribe'});
      OnlineClient.stopService();
    }
    dispatch({type: 'subscribe', payload:{addData, roomLost}});
  }


const connect = dispatch => (roomInfo, length, createRoom) => {
    const roomErrorCb = (err_msg) => {
        dispatch({type:'room-error', payload:{err_msg}});
    }
    const roomConnectedCb = (data) => {
        const active_title = data.roomname;
        const username =  data.username;
        const join_code = data.roomid;
        const active_id = createRoom(active_title, length);

        dispatch({type:'room-connected', payload:{active_id, active_title, username, join_code}});
        
        showMessage({
        message:`Joined ${active_title}`,
        type:"success",
        });
        pop();
        navigate('ChatDetail', {title:active_title, id:active_id, isChatAlive:true, isOnline:true});
    }
    const connectCb = () => {
        dispatch({type:'connected', payload:{roomInfo, roomConnectedCb, roomErrorCb}});
    }
    const connectErrorCb = () => {
        dispatch({type:'connect-error'});
    }

    dispatch({type:'connect', payload:{connectCb, connectErrorCb}});
};

const loadMsg = () => () => {
    OnlineClient.loadMsg();
};

const reset = dispatch => () => {
    dispatch({type:'reset'})
};



export const {Context, Provider} = createDataContext(onlineClientReducer, {reset, connect, subscribeAll, sendMsg, unsubscribeAll, loadConfig, loadMsg}, {active_id:'', connection:false, connection_error: {error:false, message:''}, username:'', listeners:{}, active_title:'', join_code:''});