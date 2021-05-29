import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet} from 'react-native';
import { Input, Button, Overlay, Icon} from 'react-native-elements';
import { Context as OnlineContext } from '../contexts/OnlineClientContext';
import { Context as DataContext } from '../contexts/DataContext';



const CreateChatOnline = () => {
    const [roomName, setRoomName] = useState('');
    const [roomId, setRoomId] = useState('');
    const [visible1, setVisible1] = useState(false);
    const [visible2, setVisible2] = useState(false);
    const [clicked, setClicked] = useState(false);
    const [errMsg, setErrMsg] = useState('');
    const {state:{connection_error}, connect, reset} = useContext(OnlineContext);
    const {createRoom, state} = useContext(DataContext);
    if(errMsg.length < 1 && connection_error.error){
        setClicked(false);
        setErrMsg(connection_error.message);
    }

    const toggleOverlay1 = () => {
        setVisible1(!visible1);
    };
    const toggleOverlay2 = () => {
        setVisible2(!visible2);
    };
    return (
        <View style={styles.container}>
            <Overlay isVisible={visible1} overlayStyle={styles.overlayStyle} 
            onBackdropPress={() => {   
                    if(!clicked){
                        toggleOverlay1();
                        setRoomName('');
                        setErrMsg('');
                        reset();
                    } 
                }}>
                <View>
                    <Input placeholder="Enter room name..." 
                    value={roomName}
                    onChangeText={(text) => {
                        if(text.length < 15){
                            setRoomName(text)
                        }
                    }}
                    errorMessage={errMsg}
                    errorStyle={{ color: 'red', fontSize:14, alignSelf:'center'}}
                    renderErrorMessage={true}
                    autoCapitalize='words'
                    inputStyle={{fontFamily:"OpenSans-Regular"}}
                    />

                    <Button title="Create" 
                    disabled={roomName.length<1}
                    titleStyle={{fontFamily:"OpenSans-Regular"}} 
                    buttonStyle={{backgroundColor:'#2B2D42'}}
                    loading={clicked}
                    onPress={() => {
                        if(!clicked){
                            setErrMsg('');
                            connect({type:"create", payload:roomName}, state.length, createRoom);
                            setClicked(!clicked);
                        }
                    }}
                    />
                </View>
            </Overlay>

            <Overlay isVisible={visible2} overlayStyle={styles.overlayStyle} onBackdropPress={() => {   
                    if(!clicked){
                        toggleOverlay2();
                        setRoomId('');
                        setErrMsg('');
                        reset();
                    } 
                }}>
                <View>
                    <Input placeholder="Enter room id..." 
                    value={roomId}
                    keyboardType='number-pad'
                    onChangeText={(text) => {
                        if(text.length <= 6){
                            setRoomId(text)
                        }
                    }}
                    errorMessage={errMsg}
                    errorStyle={{ color: 'red', fontSize:14, alignSelf:'center'}}
                    renderErrorMessage={true}
                    autoCapitalize='words'
                    inputStyle={{fontFamily:"OpenSans-Regular"}}
                    />

                    <Button title="Join" 
                    disabled={roomId.length<1}
                    titleStyle={{fontFamily:"OpenSans-Regular"}} 
                    buttonStyle={{backgroundColor:'#2B2D42'}}
                    loading={clicked}
                    onPress={() => {
                        if(!clicked){
                            setErrMsg('');
                            connect({type:"join", payload:roomId}, state.length, createRoom);
                            setClicked(!clicked);
                        }
                    }}
                    />
                </View>
            </Overlay>
            <View>
                <Icon name="pen-square" type="font-awesome-5" 
                color="#EF233C" size={60} 
                containerStyle={styles.buttons} 
                onPress={toggleOverlay1}
                raised/>
                <Text style={{alignSelf:'center', fontSize:18, fontFamily: 'OpenSans-SemiBold'}}>Create a Room</Text>
                <View style={{marginBottom:100}}></View>
            </View>
            <View>
                <Icon name="sign-in-alt" type="font-awesome-5" 
                color="#2B2D42" size={60} containerStyle={styles.buttons} 
                onPress={toggleOverlay2}
                raised/>
                <Text style={{color:'#EF233C', alignSelf:'center', fontSize:18, fontFamily: 'OpenSans-SemiBold'}}>Join a Room</Text>
                <View style={{marginBottom:100}}></View>
            </View>
        </View>
    );
};

CreateChatOnline.navigationOptions = () => {
    return {
        headerTitle: () => <Text style={styles.headerTextStyle}>ShhTalk Online</Text>,
        headerTintColor: "white",
        headerStyle: styles.headerStyle,
    }
};

const styles = StyleSheet.create({
    overlayStyle:{
        width:'65%',
        // height:'20%'
    },
    overlayText: {
        fontSize: 25,
        fontWeight: 'bold',
        alignSelf: 'center',
        color: '#D90429',
        marginBottom: 10,
    },
    buttons:{
        // borderWidth:1
        // height:'20%',
        // width:'50%',
        margin: 30
    },
    container: {
        flex: 1,
        backgroundColor: '#EDF2F4',
        justifyContent: 'center',
        paddingHorizontal: 80,
        alignItems: 'center',
        flexDirection: 'row',
    },
    headerStyle: {
        backgroundColor: '#2B2D42',
        height: 65
    },
    headerTextStyle: {
        fontFamily: 'OpenSans-SemiBold',
        fontSize: 25,
        color: "white"
    },
});



export default CreateChatOnline;