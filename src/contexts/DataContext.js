import createDataContext from './createDataContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const dataReducer = (state, action) => {
    switch(action.type){
        case 'set_chat':
            return state.map(element => {
                if(element.id === action.payload.id){
                    element.chats.push(action.payload.new_msg);
                }
                return element;
            });
        case 'create_room':{
            var room = {id: action.payload.id, title: action.payload.title,chats:[]};
            return [...state, room];
        }
        case 'set_data':
            return action.payload;
        case 'save_data':
            AsyncStorage.setItem('@data', JSON.stringify(state)).then().catch((error) => {
                console.log(error.message);
            });
            return state;
        case 'delete_data':
            state = state.filter(({id}) => id !== action.payload);
            AsyncStorage.setItem('@data', JSON.stringify(state)).then().catch((error) => {
                console.log(error.message);
            });
            return state;
        default:
            return state;
    }
};

const createRoom = dispatch => (title, length) => {
    let id = length+1+Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
    dispatch({type:'create_room', payload:{title, id}});
    return id;
};

const setChat = dispatch => (id, new_msg) => {
    dispatch({type:'set_chat', payload:{id, new_msg}});
};

const loadData = dispatch => async () => {
    try{
        const data = await AsyncStorage.getItem('@data');
        if(data !== null)
            dispatch({type:'set_data', payload:JSON.parse(data)});
    }catch(e){
        console.log(e.message);
    }
};

const saveData = dispatch => () => {
    dispatch({type:'save_data'});
};

const deleteData = dispatch => (id) => {
    dispatch({type:'delete_data', payload:id});
};

const data = [];

export const {Context, Provider} = createDataContext(dataReducer, {setChat, createRoom, loadData, saveData, deleteData}, data);