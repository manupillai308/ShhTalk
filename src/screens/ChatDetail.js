import React, { useState, useContext, useEffect } from 'react';
import {Context as DataContext} from '../contexts/DataContext';
import {Context as ServerDataContext} from '../contexts/ServerDataContext';
import {Context as ClientDataContext} from '../contexts/ClientDataContext';
import {Context as OnlineClientContext} from '../contexts/OnlineClientContext';
import LocalServer from '../../LocalServer';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
  Dimensions,
} from 'react-native';
import {Icon, Button} from 'react-native-elements';
import LocalClient from '../../LocalClient';
import OnlineClient from '../../OnlineClient';

const renderDate = (date) => {
    return(
      <Text style={styles.time}>
        {date}
      </Text>
    );
};

export const getCurrentTime = () => {
  let date = new Date();
  let hour = date.getHours();
  if(hour < 10){
    hour = "0" + hour;
  }
  let min = date.getMinutes();
  let meredin = "am";
  if(hour >= 13){
    hour -= 12;
    meredin = "pm";
  }
  if(min < 10){
    min = "0" + min;
  }
  let str = hour + ":" + min + " " + meredin;

  return str;
};

const ChatDetail = ({navigation}) => {

    let flatListRef;
    const [msg, setMsg] = useState('');
    const {state, setChat} = useContext(DataContext);

    const isClient = navigation.getParam('isClient');
    const isOnline = navigation.getParam('isOnline');
    clientContext = useContext(ClientDataContext);
    serverContext = useContext(ServerDataContext);
    onlineContext = useContext(OnlineClientContext);
    let context_data;
    if(isClient) context_data = clientContext; 
    else if (isOnline) context_data = onlineContext;
    else context_data = serverContext;
    const {state:{username, active_id, join_code}, sendMsg, unsubscribeAll, subscribeAll, loadMsg} = context_data;
    const isChatAlive = (active_id === navigation.getParam('id')); //navigation.getParam("isChatAlive");
    useEffect(() => {
      if(isChatAlive){
        subscribeAll(active_id, setChat);
        loadMsg();
      }
      return () => {
        unsubscribeAll();
      }
    }, []);
    const {id, chats:data} = state.find(element => element.id === navigation.getParam('id'));

    return (
        <View style={styles.container}>
          {join_code ? 
          <Text style={{fontFamily:"OpenSans-SemiBold", fontSize:15, alignSelf:'center', color:"#D90429"}}>
            <Text style={{color:"#2B2D42"}}>Room ID for joining: </Text><Text>{join_code}</Text>
          </Text>:null}
          <FlatList ref={ref => flatListRef = ref}
            onLayout={() => flatListRef.scrollToEnd({animated: false})}
            style={styles.list}
            data={data}
            onContentSizeChange={() => flatListRef.scrollToEnd({animated: false})}
            keyExtractor= {(item) => {
              return item.id;
            }}
            renderItem={({item}) => {
              if(item.type === 'system'){
                return <View style={styles.systemStyle}>
                  <Text style={styles.systemFontStyle}>
                    <Text style={[styles.systemFontStyle, {fontFamily:'OpenSans-Bold'}]}>{item.user} </Text>
                    <Text>{item.message}  </Text>
                  </Text>
                </View>
              }
              let inMessage = item.type === 'in';
              let itemStyle = inMessage ? styles.itemIn : styles.itemOut;
              return (
                <View style={[styles.item, itemStyle]}>
                  {true ? <Text style={{paddingLeft:5, color:'black', fontFamily: "OpenSans-Bold"}}>{item.user}</Text> : null}
                    <View style={[styles.balloon]}>
                      <Text style={{fontFamily: "OpenSans-Regular", fontSize:15, paddingVertical:5}}>{item.message}</Text>
                    </View>
                    {renderDate(item.date)}
                  {/* </View> */}
                </View>
              )
            }}/>
          <View style={styles.footer}>
            {!isChatAlive ?
            <View style={{
              justifyContent:'center',
              alignItems:'center',
              flex:1
            }}>
              <Text style={{
                fontSize:Dimensions.get('window').width/21.82,
                color:'#646466',
                fontFamily: "OpenSans-SemiBold",
              }}>You can't reply to this conversation</Text>
            </View> : null}
            {isChatAlive ? <>
            <View style={styles.inputContainer}>
              <TextInput multiline style={{...styles.inputs, color:'black'}}
                  placeholder="Write a message..."
                  placeholderTextColor="#adadad" 
                  value={msg}
                  onChangeText={setMsg}/>
            </View> 
            <TouchableOpacity style={styles.btnSend} onPress={() => {
              if(msg.trim().length > 0){
                let _msg = {date: getCurrentTime(), type:"out", message:msg.trim(), user:username};
                setChat(id, _msg);
                setMsg('');
                sendMsg(_msg);
              };
            }}>
                <Icon type="entypo" name="paper-plane" size={25}/>
            </TouchableOpacity>
            </> : null}
          </View>
        </View>
      );

}

ChatDetail.navigationOptions = ({navigation}) => {
    var header = {
        headerTitle: () => <Text style={styles.headerTextStyle}>{navigation.getParam('title')}</Text>,
        headerStyle: styles.headerStyle,
        headerTintColor:"white",
    };
    if(navigation.getParam('isChatAlive')){
      header = {...header, headerRight: () => {
        const title = (navigation.getParam("isOnline") || navigation.getParam('isClient')) ? "Leave Room" : "Stop Room";
        return (
        <Button buttonStyle={{borderColor:"#EF233C", backgroundColor:"#D90429", borderRadius:10}} 
            containerStyle={{paddingRight:20, paddingVertical:10}} 
            type="solid" title={title} 
            titleStyle={{fontFamily: "OpenSans-SemiBold", fontSize: Dimensions.get('window').width/28}}
            onPress={() => {
              if(navigation.getParam('isClient')) LocalClient.stopClient()
              else if (navigation.getParam('isOnline')) OnlineClient.stopService();
              else LocalServer.stopServer();
              navigation.pop();
            // navigation.setParams({'isChatAlive':false});
          }}/> 
      )}};
    }
    return header;
};

const styles = StyleSheet.create({
    headerStyle: {
      backgroundColor: '#2B2D42',
    },
    systemStyle:{
      alignItems:'center',
      marginTop:5,
    },
    systemFontStyle:{
      fontSize:14,
      fontFamily: "OpenSans-Regular",
    },
    headerTextStyle: {
        fontSize:Dimensions.get('window').width/17,
        fontFamily: "OpenSans-SemiBold",
        color:"white"
    },
    container:{
        flex:1,
        backgroundColor:'#EDF2F4'
    },
    list:{
        paddingHorizontal: 17,
    },
    footer:{
        flexDirection: 'row',
        height:60,
        backgroundColor: 'rgba(255,255,255,0)',
        paddingHorizontal:10,
        padding:5,
    },
    btnSend:{
        backgroundColor:"white",
        width:40,
        height:40,
        borderRadius:360,
        alignItems:'center',
        justifyContent:'center',
    },
    iconSend:{
        width:30,
        height:30,
        alignSelf:'center',
    },
    inputContainer: {
        borderBottomColor: '#EDF2F4',
        backgroundColor: '#FFFFFF',
        borderRadius:30,
        borderBottomWidth: 1,
        height:45,
        flexDirection: 'row',
        alignItems:'center',
        flex:1,
        marginRight:10,
    },
    inputs:{
        height:40,
        marginLeft:16,
        borderBottomColor: '#FFFFFF',
        flex:1,
        fontSize:15,
        fontFamily: "OpenSans-Regular"
    },
    balloon: {
        maxWidth: 250,
        alignSelf:'flex-start',
        paddingHorizontal:5,
        borderRadius: 20,
        minWidth: 100,
    },
    itemIn: {
        alignSelf: 'flex-start',
        borderBottomRightRadius:15,
        borderTopRightRadius:15,
        borderTopLeftRadius:15,
        backgroundColor:'#FBBA74'
    },
    itemOut: {
        alignSelf: 'flex-end',
        borderBottomLeftRadius:15,
        borderTopRightRadius:15,
        borderTopLeftRadius:15,
        backgroundColor:'#FFA970'
    },
    time: {
        alignSelf: 'flex-end',
        paddingLeft:5,
        fontSize:12,
        color:"#050408",
    },
    item: {
        marginVertical: 14,
        flex: 1,
        backgroundColor:"#eeeeee",
        padding:5,
    },
}); 


export default ChatDetail;