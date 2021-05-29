import React, {useState, useContext} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Input, Button, Avatar} from 'react-native-elements';
import {Context as DataContext} from '../contexts/DataContext';
import {Context as ServerDataContext} from '../contexts/ServerDataContext';



const CreateChat = ({navigation}) => {
    const [value, setValue] = useState('');
    const {createRoom, state} = useContext(DataContext);
    const {createServer} = useContext(ServerDataContext);
    return (
        <View style={styles.container}>
            <Avatar 
                rounded
                overlayContainerStyle={{backgroundColor:"#EF233C", borderWidth:3, borderColor:"#f75252"}}
                title={(value.length > 0) ? value : "Shh"}
                size={120}
            />
            <Input 
                placeholder="Enter room name..."
                value={value}
                onChangeText={(text) => {
                    if(text.length < 15){
                        setValue(text)
                    }
                }}
                autoCapitalize='words'
                style={{marginTop:10}}
                inputStyle={{fontFamily:"OpenSans-Regular", textAlign:'center'}}
            />
            <Button title="Let's Go" disabled={value.length<1} titleStyle={{fontFamily:"OpenSans-Regular"}} buttonStyle={{backgroundColor:'#2B2D42'}} onPress={() => {
                let id = createRoom(value, state.length);
                createServer(id, value);
                navigation.pop();
                navigation.navigate('ChatDetail', {title:value, id, isChatAlive:true});
            }}/>
            <View style={{marginBottom:100}}></View>
        </View>
    );
};

CreateChat.navigationOptions = () => {
    return {
        headerTitle: () => <Text style={styles.headerTextStyle}>Create Room</Text>,
        headerTintColor:"white",
        headerStyle: styles.headerStyle,
    }
};

const styles = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:'#EDF2F4',
        justifyContent:'center',
        paddingHorizontal:80,
        alignItems:'center',
    },
    headerStyle: {
        backgroundColor: '#2B2D42',
        height:65
    },
    headerTextStyle: {
        fontFamily: 'OpenSans-SemiBold',
        fontSize:25,
        color:"white"
    },
});



export default CreateChat;