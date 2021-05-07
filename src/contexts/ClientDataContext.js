import createDataContext from './createDataContext';
import { NetworkInfo } from 'react-native-network-info';
import { showMessage } from "react-native-flash-message";
import {navigate} from '../navigationRef';
var net = require('react-native-tcp');


const clientDataReducer = (state, action) => {
    switch(action.type){
        case 'connect':{
            const client = net.createConnection(6060,action.payload.ip, () => {
                console.log('opened client on ' + JSON.stringify(client.address()));
              });
          
              client.on('data', (data) => {
                data = JSON.parse(data);
                let {title} = data;
                if(title){
                  showMessage({
                    message:`Joined ${title}`,
                    type:"success",
                  })
                  let id = action.payload.createRoom(title, action.payload.length);
                  state.id = id;
                  action.payload.dispatch({type:'set_user_id', payload:{id, user:data.user}});
                  navigate('ChatDetail', {title:title, id:id, isChatAlive:true, isClient:true});
                }else{
                  if(data.type !== 'system')
                    action.payload.callback(state.id, {...data, type:'in'});
                  else
                    action.payload.callback(state.id, data);
                }
              });
          
              client.on('error', (error) => {
                showMessage({
                  message:"Cannot Join Room",
                  description:"Its seem you are not connected to the hotspot or the admin has not created the room.",
                  type:"danger",
                  duration: 3500,
                })
                console.log('client error ' + error);
              });
          
              client.on('close', () => {
                console.log('client close');
              });

              return {...state, client};
        }
        case 'set_user_id':
          return {...state, id: action.payload.id, username:action.payload.user};
        case 'reset':
          if(state.client)
            state.client.destroy();
          return {client:null};
        case 'broadcast':
          state.client.write(JSON.stringify(action.payload));
          return state;
        default:
            return state;
    }
};

const connectClient = dispatch => async (createRoom, length, callback) => {
    let ip = await NetworkInfo.getGatewayIPAddress();
    dispatch({type:'connect', payload:{ip, callback, createRoom, length, dispatch}});
};

const reset = dispatch => () => {
  dispatch({type:'reset'});
};

const setId = dispatch => (id) => {
  dispatch({type:'set_id', payload:id});
};

const broadcastMsg = dispatch => (data) => {
  dispatch({type:'broadcast', payload:data});
};

export const {Context, Provider} = createDataContext(clientDataReducer, {connectClient, broadcastMsg, reset, setId}, {client:null, username:'', id:null});