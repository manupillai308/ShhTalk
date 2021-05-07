import React from 'react';
import {StyleSheet} from 'react-native';
import { ListItem, Avatar } from 'react-native-elements';

const Chat = ({title}) => {

    return (
            <ListItem bottomDivider containerStyle={styles.containerStyle}>
                <Avatar 
                    rounded
                    source={require('../../assets/chat_icon.png')}
                    size='medium'
                />
                <ListItem.Content>
                <ListItem.Title style={styles.textStyle}>{title}</ListItem.Title>
                </ListItem.Content>
            </ListItem>
    );

};


const styles = StyleSheet.create({
    textStyle:{
        fontSize:19,
    },
    containerStyle:{
        backgroundColor:'#f3edf7',
        paddingVertical:10,
        marginHorizontal:10
    }
});


export default Chat;