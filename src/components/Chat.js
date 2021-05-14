import React from 'react';
import {StyleSheet, View} from 'react-native';
import { ListItem, Avatar, Badge} from 'react-native-elements';

const Chat = ({title, subtitle}) => {
    const color = (subtitle == "Room Active") ? "#039910": "#b01804";
    return (
            <ListItem bottomDivider containerStyle={styles.containerStyle}>
                <View>
                    <Avatar
                        rounded
                        overlayContainerStyle={{backgroundColor:"#EF233C", borderWidth:1, borderColor:"#f75252"}}
                        title={title}
                        size={55}
                    />
                    {subtitle == "Room Active"?
                    <Badge
                        status="success"
                        containerStyle={{ position: 'absolute', top: 2, right: 2}}
                        badgeStyle={{height:11, width:11}}
                    />:null}
                </View>
                <ListItem.Content>
                <ListItem.Title style={styles.textStyle}>{title}</ListItem.Title>
                <ListItem.Subtitle style={{color}}>{subtitle}</ListItem.Subtitle>
                </ListItem.Content>
            </ListItem>
    );

};


const styles = StyleSheet.create({
    textStyle:{
        fontSize:19,
        fontFamily:"OpenSans-SemiBold",
    },
    containerStyle:{
        backgroundColor:'#d5dbe6',
        paddingVertical:10,
    }
});


export default Chat;