import createDataContext from './createDataContext';
import {getCurrentTime} from '../screens/ChatDetail';
var net = require('react-native-tcp');


var names = [
  "Sansa",
  "Mowgli",
  "Cricket",
  "Banjo",
  "Diezel Ky",
  "Kal-El",
  "Satchel",
  "Egypt",
 " Buddy Bear",
  "Tiamii",
  "Bluebell Madonna",
  "Fifibelle",
  "Apple",
  "Destry",
  "Tu Morrow",
  "North",
  "Sunday",
  "Jermajesty",
  "Tokyo",
  "Levaeh",
  "Adeline",
  "Audi",
  "Alucard",
  "Sparrow",
  "Correspondent",
  "Seven",
  "Puma",
  "Camera",
  "Bandit",
  "Hashtag",
  "Facebook",
  "Mustard",
  "Cherry",
  "Summer Rain",
  "River Rose",
  "Nutella",
  "Daisy Boo",
  "Free",
  "Megaa Omari"
];


const serverDataReducer = (state, action) => {
    switch(action.type){
        case 'create_server':{
            const server = net.createServer((socket) => {
                console.log('server connected on ' + JSON.stringify(socket.address()));
                let user;
                while(true){
                  user = names[Math.floor(Math.random() * names.length)];
                  if(!state.clients.find(element => element.user === user) && user != state.username) break;
                }

                socket.write(JSON.stringify({user, title:action.payload.title}));
                
                action.payload.addClient({user, socket});
                action.payload.addData(socket.address(), {id:Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5), date:getCurrentTime(), type:'system',  message: "joined the chat", user})

                socket.on('data', (data) => {
                    data = JSON.parse(data);
                    if(data.type !== 'system')
                      action.payload.addData(socket.address(), {...data, type:'in'});
                    else
                      action.payload.addData(socket.address(), data);
                });
                socket.on('error', (error) => {
                  console.log('error ' + error);
                });
                socket.on('close', (error) => {
                  console.log('server client closed ' + (error ? error : ''));
                });
              }).listen(6060, () => {
                console.log('opened server on ' + JSON.stringify(server.address()));
              });
            
              server.on('error', (error) => {
                console.log('error ' + error);
              });
              server.on('close', () => {
                console.log('server close');
              });
            state.username = names[Math.floor(Math.random() * names.length)];
            return {...state, server};
        }

        case 'broadcast':{
            state.clients.forEach(({socket}) => {
                if(socket.address() === action.payload.address) return;
                socket.write(JSON.stringify(action.payload.data));
            });
            return state;
        }
        case 'add_client':
            return {...state, clients:[...state.clients, action.payload]};

        case 'reset':
            if(state.server){
              state.clients.forEach(({socket}) => {
                socket.destroy();
              });
              state.server.close();
            }
            return {server:null, clients:[], username:''};
        default:
            return state;
    }
};

const broadcastMsg = dispatch => (data) => {
  dispatch({type:'broadcast', payload:{address:'', data}});
};

const reset = dispatch => () => {
  dispatch({type:'reset'});
};

const createServer = dispatch => (id, title, callback) => {

    const addClient = (client) => {
        dispatch({type:'add_client', payload:client});
    }
    const addData = (address, data) => {
        callback(id, data);
        dispatch({type:'broadcast', payload:{address, data}});
    }
    dispatch({type:'create_server', payload:{addData, addClient, title}});
};


export const {Context, Provider} = createDataContext(serverDataReducer, {createServer, broadcastMsg, reset}, {server:null, clients:[], username:''});