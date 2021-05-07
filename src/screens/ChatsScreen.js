import React, {useState, useContext, useEffect} from 'react';
import {Context as DataContext} from '../contexts/DataContext';
import {Context as ClientDataContext} from '../contexts/ClientDataContext';
import {Text, View, StyleSheet, FlatList, TouchableOpacity, Dimensions} from 'react-native';
import Chat from '../components/Chat';
import {Icon, Overlay, Button} from 'react-native-elements';
import {FloatingAction} from 'react-native-floating-action';


// const ChatsScreen = ({navigation}) => {
//     const {state:data, createRoom, setChat, loadData, saveData, deleteData} = useContext(DataContext);
//     const [del, setDel] = useState({visible:false, key:null});
//     const [visible, setVisible] = useState(false);
//     const {connectClient} = useContext(ClientDataContext);
//     useEffect(() => {
//         navigation.setParams({needsConfirmation:false});
//         loadData();
//         return () => {
//             saveData();
//         };
//       }, []);

//     const toggleOverlay = () => {
//         setVisible(!visible);
//     };
//     const actions = [
//         {
//             text: "Create Room",
//             icon: <Icon reverse name="edit-3" type='feather' size={25} color="#967DE7" />,
//             name: "create_room",
//             textStyle: styles.textStyle
//         },
//         {
//             text: "Join Room",
//             icon: <Icon reverse name="log-in" type='feather' size={25} color="#967DE7" />,
//             name: "join_room",
//             textStyle: styles.textStyle
//         }
//     ];

//     return <View style={styles.container}>
//         {data.length > 0 ? <FlatList 
//             keyExtractor={item => item.id}
//             data={data}
//             renderItem={({item}) => {
//                 return  <TouchableOpacity onLongPress={() => {
//                             setDel({visible:!del.visible, key:item.id});
//                         }} 
//                     onPress={() => {navigation.navigate('ChatDetail', {title:item.title, id:item.id, isChatAlive:false})}}>
//                         <Chat title={item.title}/>
//                      </TouchableOpacity>            
//            }}
//         />: 
//             <View style={{paddingBottom:100, flex:1, justifyContent:'center', alignItems:'center'}}>
//                 <Text style={{fontSize:23, textAlign:"center", color:'rgba(0,0,0,0.3)'}}>Nothing here.{"\n"} Tap "+" to create or join a chat room.</Text>
//             </View>
//         }
//         <Overlay isVisible={del.visible} overlayStyle={{width: Dimensions.get('window').width*0.7}} onBackdropPress={() => {setDel({visible:!del.visible, key:null})}}>
//             <TouchableOpacity onPress = {() => {
//                 deleteData(del.key);
//                 // saveData();
//                 setDel({visible:!del.visible, key:null});
//             }}>
//                 <Text style={{fontSize:20, marginLeft:5}}>Delete</Text>
//             </TouchableOpacity>
//         </Overlay>
//         <Overlay isVisible={visible} overlayStyle={styles.overlayStyle} onBackdropPress={toggleOverlay}>
//             <Text style={styles.overlayText}>Attention!   </Text>
//             <Text style={{fontSize:17, padding:16, textAlign:'justify', borderWidth:1, borderRadius:15, marginBottom:5}}>You are about to join a chatroom. Before proceeding, 
//             {"\n"}{"\n"}{'\u2022'} Ensure that you are connected to the mobile hotspot of the room admin. 
//             {"\n"}{"\n"}{'\u2022'} Don't close the chat window, else you will be disconnected from the room.</Text>
//             <View style={{backgroundColor:'#967DE7', flexDirection:'row', bottom:0, left:0, right:0}}>
//                 <View style={{flex:1}}>
//                     <Button title="Cancel" onPress={toggleOverlay} buttonStyle={{backgroundColor:'#967DE7'}}/>
//                 </View>
//                 <View style={{flex:1}}>
//                     <Button title="Continue" onPress={() => {
//                         toggleOverlay();
//                         connectClient(createRoom, data.length, setChat);
//                     }} buttonStyle={{backgroundColor:'#967DE7'}}/>
//                 </View>
//             </View>
//         </Overlay>
//         <FloatingAction
//             actions={actions}
//             overlayColor='rgba(0, 0, 0, 0.5)'
//             color="#967DE7"
//             onPressItem={name => {
//                 if(name == 'create_room')
//                     navigation.navigate('Room');
//                 else{
//                     toggleOverlay();
//                 }
//             }}
//         />
//     </View>;
// };


// ChatsScreen.navigationOptions = () => {
//     return {
//         headerTitle: () => <Text style={styles.headerTextStyle}>ShhTalk</Text>,
//         headerStyle: styles.headerStyle,
//     };
// };

// const styles = StyleSheet.create({
//     headerStyle: {
//         backgroundColor: '#DACFFE',
//     },
//     headerTextStyle: {
//         fontSize:30,
//         fontWeight:'bold'
//     },
//     container:{
//         flex:1
//     },
//     textStyle:{
//         fontSize:15,
//     },
//     overlayStyle:{
//         // height:'48%',
//         width:Dimensions.get('window').width*0.75,
//     },
//     overlayText:{
//         fontSize: 25,
//         fontWeight:'bold',
//         alignSelf:'center',
//         color:'#b82c02',
//         marginBottom:10,
//     }
// });


// export default ChatsScreen;

import { NativeEventEmitter, NativeModules } from 'react-native';

import LocalServer from '../../LocalServer';

const App = () => {

    useEffect(() => {
        const eventEmitter = new NativeEventEmitter(NativeModules.ToastExample);
        const events = ["server-disconnect", 'server-success', 'server-error'];
        var subscribers = [];
        events.forEach((ele) => {
            const subscription = eventEmitter.addListener(`${ele}`, (data) => {
                console.log(`${ele}`, data);
            });
            subscribers.push(subscription);    
        })

        return () => {
            subscribers.forEach((ele) => {
                ele.remove();
            })
        }
    }, []);
    return (

    <View>

        <View >

        <TouchableOpacity

            onPress={() => LocalServer.startServer()}>

            <Text>Start</Text>

        </TouchableOpacity>

        <TouchableOpacity

            onPress={() => LocalServer.stopServer()}>

            <Text>Stop</Text>

        </TouchableOpacity>

        </View>

    </View>

    );

};

export default App;