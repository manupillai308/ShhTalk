import React, {useState, useContext, useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Icon, Input, Button} from 'react-native-elements';
import {Context as DataContext} from '../contexts/DataContext';
import {Context as ServerDataContext} from '../contexts/ServerDataContext';



const CreateChat = ({navigation}) => {
    const [value, setValue] = useState('');
    const {createRoom, state} = useContext(DataContext);
    const {createServer} = useContext(ServerDataContext);
    useEffect(() => {
        navigation.setParams({needsConfirmation:false});
      }, []);
    return (
        <View style={styles.container}>
            <Icon reverse name="edit-3" type='feather' size={30} color="#967DE7" />
            <Input 
                placeholder="Enter room name"
                value={value}
                onChangeText={setValue}
                autoCapitalize='words'
                style={{marginTop:10}}
            />
            <Button title="Let's Go" buttonStyle={{backgroundColor:'#967DE7'}} onPress={() => {
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
        headerStyle: styles.headerStyle,
    }
};

const styles = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:'#f3edf7',
        justifyContent:'center',
        paddingHorizontal:80,
        alignItems:'center',
    },
    headerStyle: {
        backgroundColor: '#DACFFE',
    },
    headerTextStyle: {
        fontSize:20,
        fontWeight:'bold'
    },
});



export default CreateChat;