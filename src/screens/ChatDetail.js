import React, { useState, useContext, useEffect } from 'react';
import {Context as DataContext} from '../contexts/DataContext';
import {Context as ServerDataContext} from '../contexts/ServerDataContext';
import {Context as ClientDataContext} from '../contexts/ClientDataContext';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import {Icon} from 'react-native-elements';

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
  let min = date.getMinutes();
  let meredin = "am";
  if(hour >= 13){
    hour -= 12;
    meredin = "pm";
  }
  if(JSON.stringify(min).length < 2){
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
    let context_data;
    if(isClient) {
      context_data = useContext(ClientDataContext); 
    }
    else context_data = useContext(ServerDataContext);
    const {state:{username}, broadcastMsg, reset} = context_data;

    const {id, chats:data} = state.find(element => element.id === navigation.getParam('id'));
    const isChatAlive = navigation.getParam('isChatAlive');
    if(isChatAlive){
      useEffect(() => {
        navigation.setParams({needsConfirmation:true});
        return () => {
          let _id = "Sys"+data.length+Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
          let _msg = "closed", _user="Room";
          if(isClient){
            _msg = "left the chat"
            _user = username;
          }
          broadcastMsg({id:_id, date: getCurrentTime(), type:'system',  message: _msg, user:_user});
          reset();
        };
      }, []);
    }
    return (
        <View style={styles.container}>
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
                    <Text style={[styles.systemFontStyle, {fontWeight:'bold'}]}>{item.user} </Text>
                    <Text>{item.message}  </Text>
                  </Text>
                </View>
              }
              let inMessage = item.type === 'in';
              let itemStyle = inMessage ? styles.itemIn : styles.itemOut;
              return (
                <View style={[styles.item, itemStyle]}>
                  {inMessage ? <Text style={{paddingLeft:5, fontWeight:'bold', color:'black'}}>{item.user}</Text> : null}
                  <View style={[{flexDirection: 'row',}]}>
                    {!inMessage && renderDate(item.date)}
                    <View style={[styles.balloon]}>
                      <Text>{item.message}</Text>
                    </View>
                    {inMessage && renderDate(item.date)}
                  </View>
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
                fontSize:18,
                color:'#646466',
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
                let _msg = {id:data.length+1+Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5), date: getCurrentTime(), type:"out", message:msg.trim(), user:username};
                setChat(id, _msg);
                setMsg('');
                broadcastMsg(_msg);
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
    const header = {
        headerTitle: () => <Text style={styles.headerTextStyle}>{navigation.getParam('title')}</Text>,
    };

    if(navigation.getParam('isChatAlive')){
      return {...header, headerLeft: () => null}
    }else{
      return header;
    }
};

const styles = StyleSheet.create({
    systemStyle:{
      alignItems:'center',
      marginTop:5,
    },
    systemFontStyle:{
      fontSize:13
    },
    headerTextStyle: {
        fontSize:23,
        fontWeight:'bold'
    },
    container:{
        flex:1,
        backgroundColor:'#efebff'
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
        borderBottomColor: '#F5FCFF',
        backgroundColor: '#FFFFFF',
        borderRadius:30,
        borderBottomWidth: 1,
        height:40,
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
    },
    balloon: {
        maxWidth: 250,
        alignSelf:'center',
        paddingHorizontal:5,
        borderRadius: 20,
    },
    itemIn: {
        alignSelf: 'flex-start',
        borderBottomRightRadius:15,
        borderTopRightRadius:15,
        borderTopLeftRadius:15,
        backgroundColor:'#bda9fc'
    },
    itemOut: {
        alignSelf: 'flex-end',
        borderBottomLeftRadius:15,
        borderTopRightRadius:15,
        borderTopLeftRadius:15,
        backgroundColor:'#dacffe'
    },
    time: {
        alignSelf: 'flex-end',
        margin: 10,
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