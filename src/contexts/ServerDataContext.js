import createDataContext from './createDataContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getCurrentTime} from '../screens/ChatDetail';
import { NativeEventEmitter, NativeModules } from 'react-native';
import LocalServer from '../../LocalServer';
var seedrandom = require('seedrandom');


const serverDataReducer = (state, action) => {
  switch(action.type){
    case 'server_open':{
      AsyncStorage.setItem('@server_data', JSON.stringify({...state, listeners:{}, username:action.payload})).then().catch((error) => {
        console.log(error.message);
      });
      // console.log("server-open with", action.payload);
      seedrandom(action.payload, { global: true });
      return {...state, username:action.payload};
    }
    case 'server_close':{
      const data = {active_id:'', server_open:false, clients:[], username:''};
      AsyncStorage.setItem('@server_data', JSON.stringify(data)).then().catch((error) => {
        console.log(error.message);
      });
      return {...state, ...data};
    }
    case 'server_error':{
      AsyncStorage.setItem('@server_data', JSON.stringify({...state, listeners:{}, server_open:false, server_error:true, active_id:''})).then().catch((error) => {
        console.log(error.message);
      });
      return {...state, server_open:false, server_error:true, active_id:''};
    }
    case 'create_server':{
      LocalServer.startServer(action.payload.title);
      AsyncStorage.setItem('@server_data', JSON.stringify({...state, server_open:true, listeners:{}, active_id:action.payload.id})).then().catch((error) => {
        console.log(error.message);
      });
      return {...state, server_open:true, active_id:action.payload.id};
    }
    case 'subscribe':{
      // console.log("Subscription called");
      const eventEmitter = new NativeEventEmitter(NativeModules.ToastExample);
      const start = eventEmitter.addListener('server-start', (data) => {
        action.payload.serverOpen(data.payload); //client name
      });

      const error = eventEmitter.addListener('server-error', () => {
        action.payload.serverError();
      });

      const close = eventEmitter.addListener('server-close', () => {
        action.payload.serverClose();
      }); 
      const connect = eventEmitter.addListener('client-connect', (params) => {
        action.payload.addClient(params);
        const data = {id:Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5), date:getCurrentTime(), type:'system',  message: "joined the chat", user:params.name};
        LocalServer.sendMsg(params.address, JSON.stringify(data));
        action.payload.addData(data);
      });

      const disconnect = eventEmitter.addListener('client-disconnect', (params) => {
        action.payload.removeClient(params);
        const data = {id:Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5), date:getCurrentTime(), type:'system',  message: "left the chat", user:params.name};
        LocalServer.sendMsg(params.address, JSON.stringify(data));
        action.payload.addData(data);
      });
      const message = eventEmitter.addListener('message', (params) => {
        const data = JSON.parse(params.payload)
        // console.log("client-message", params.payload);
        action.payload.addData(data);
      });
      return {...state, listeners: {...state.listeners, connect, disconnect, start, error, close, message}};
    }

    case 'remove_client':{
      const clients = state.clients.filter(client => client.address == action.payload.address);
      AsyncStorage.setItem('@server_data', JSON.stringify({...state, listeners:{}, clients})).then().catch((error) => {
        console.log(error.message);
      });
      return {...state, clients};
    }

    case 'add_client':{
      AsyncStorage.setItem('@server_data', JSON.stringify({...state, listeners:{}, clients:[...state.clients, action.payload]})).then().catch((error) => {
        console.log(error.message);
      });
      return {...state, clients:[...state.clients, action.payload]};
    }

    case 'unsubscribe':{
      // console.log("unsubscribe called", state.listeners);
      for(let key in state.listeners){
        // console.log("key", key);
        state.listeners[key].remove();
      }
      AsyncStorage.setItem('@server_data', JSON.stringify({...state, listeners:{}})).then().catch((error) => {
        console.log(error.message);
      });
      return {...state, listeners:{}};
    }
            
    case 'send_msg':{
      // console.log("server-message(sender side)", JSON.stringify({...action.payload, type:"in", user:state.username}));
      LocalServer.sendMsg(" ", JSON.stringify({...action.payload, type:"in", user:state.username}));
      return state
    }
    case 'set_data':
      return {...action.payload, listeners: state.listeners};
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
    var data = await AsyncStorage.getItem('@server_data');
    if(data !== null) dispatch({type:'set_data', payload:JSON.parse(data)});
  }catch(e){
    console.log(e.message);
  }
}

const subscribeAll = dispatch => (id, callback) => {
  const addClient = (client) => {
      dispatch({type:'add_client', payload:client});
  }
  const addData = (data) => {
      callback(id, data);
  }
  const removeClient = (data) => {
    dispatch({type:'remove_client', payload:data});
  }
  const serverOpen = (data) => {
    dispatch({type:'server_open', payload:data});
  }
  const serverClose = () => {
    dispatch({type:'server_close'});
    dispatch({type:'unsubscribe'});
  }
  const serverError = () => {
    dispatch({type:'server_error'});
    dispatch({type:'unsubscribe'});
  }
  dispatch({type: 'subscribe', payload:{addClient, addData, serverOpen, serverError, serverClose, removeClient}});
}


const createServer = dispatch => (id, title) => {
  dispatch({type:'create_server', payload:{id, title}});
};

const loadMsg = () => () => {
  LocalServer.loadMsg(); 
}

export const {Context, Provider} = createDataContext(serverDataReducer, {createServer, loadConfig, unsubscribeAll, sendMsg, subscribeAll, loadMsg}, {active_id:'', server_open:false, clients:[], username:'', listeners:{}});