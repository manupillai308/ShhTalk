import React, { useState, useContext, useEffect } from 'react';
import { Context as DataContext } from '../contexts/DataContext';
import { Context as ClientDataContext } from '../contexts/ClientDataContext';
import { Context as ServerDataContext } from '../contexts/ServerDataContext';
import { Context as OnlineClientContext} from '../contexts/OnlineClientContext';
import { showMessage } from "react-native-flash-message";
import { Text, View, StyleSheet, FlatList, TouchableOpacity, Dimensions} from 'react-native';
import Chat from '../components/Chat';
import { Icon, Overlay, Button} from 'react-native-elements';
import { FloatingAction } from 'react-native-floating-action';


const ChatsScreen = ({ navigation }) => {
    const { state: data, createRoom, saveData, deleteData } = useContext(DataContext);
    const { state: { active_id: server_active_id, server_open}} = useContext(ServerDataContext);
    const { state: { active_id: client_active_id, client_open}} = useContext(ClientDataContext);
    const { state: { active_id: online_active_id, connection: online_open}} = useContext(OnlineClientContext);
    const [del, setDel] = useState({ visible: false, key: null});
    const [visible, setVisible] = useState(false);
    const {connectClient} = useContext(ClientDataContext);


    useEffect(() => {
        return () => {
            saveData();
        };
    }, []);

    const toggleOverlay = () => {
        setVisible(!visible);
    };
    const actions = [
        {
            text: "Go Online",
            icon: <Icon reverse name="globe-asia" type='font-awesome-5' size={25} color="#2B2D42" />,
            name: "go_online",
            textStyle: styles.textStyle,
            textBackground:"#D90429"
        },
        {
            text: "Create Room",
            icon: <Icon reverse name="edit-3" type='feather' size={25} color="#2B2D42" />,
            name: "create_room",
            textStyle: styles.textStyle,
            textBackground:"#D90429"
        },
        {
            text: "Join Room",
            icon: <Icon reverse name="log-in" type='feather' size={25} color="#2B2D42" />,
            name: "join_room",
            textStyle: styles.textStyle,
            textBackground:"#D90429"
        }
    ];

    return <View style={styles.container}>
        {data.length > 0 ? <FlatList
            keyExtractor={item => item.id}
            data={data}
            renderItem={({ item }) => {
                return <TouchableOpacity onLongPress={() => {
                    if (server_active_id != item.id && client_active_id != item.id) setDel({ visible: !del.visible, key: item.id });
                }}
                    onPress={() => { 
                            let isChatAlive = false;
                            let isClient = false;
                            let isOnline = false;
                            if(server_open && (item.id == server_active_id)) isChatAlive = true;
                            else if(client_open && (item.id == client_active_id)){
                                isChatAlive = true;
                                isClient = true;
                            }
                            else if(online_open && (item.id == online_active_id)){
                                isChatAlive = true;
                                isOnline = true;
                            }
                            navigation.navigate('ChatDetail', { title: item.title, id: item.id, isChatAlive, isClient, isOnline}) 
                        }}>
                    <Chat title={item.title} subtitle={((server_open && item.id == server_active_id) || (client_open && item.id == client_active_id) || (online_open && item.id == online_active_id)) ? "Room Active":"Room Closed"} />
                </TouchableOpacity>
            }}
        /> :
            <View style={{ paddingBottom: 100, flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 23, fontFamily: "OpenSans-SemiBold", textAlign: "center", color: 'rgba(0,0,0,0.3)' }}>Nothing here.{"\n"} Tap "+" to create or join a chat room.</Text>
            </View>
        }
        <Overlay isVisible={del.visible} overlayStyle={{ width: Dimensions.get('window').width * 0.7 }} onBackdropPress={() => { setDel({ visible: !del.visible, key: null }) }}>
            <TouchableOpacity onPress={() => {
                deleteData(del.key);
                // saveData();
                setDel({ visible: !del.visible, key: null });
            }}>
                <Text style={{ fontSize: 20, marginLeft: 5 }}>Delete</Text>
            </TouchableOpacity>
        </Overlay>
        <Overlay isVisible={visible} overlayStyle={styles.overlayStyle} onBackdropPress={toggleOverlay}>
            <Text style={styles.overlayText}>Attention!   </Text>
            <Text style={{ fontSize: 17, padding: 16, textAlign: 'justify', borderWidth: 1, borderRadius: 15, marginBottom: 5 }}>You are about to join a chatroom. Before proceeding,
            {"\n"}{"\n"}Ensure that you are connected to the mobile hotspot of the room admin.</Text>
            <View style={{ backgroundColor: '#2B2D42', flexDirection: 'row', bottom: 0, left: 0, right: 0 }}>
                <View style={{ flex: 1 }}>
                    <Button title="Cancel" onPress={toggleOverlay} buttonStyle={{ backgroundColor: '#2B2D42' }} />
                </View>
                <View style={{ flex: 1 }}>
                    <Button title="Continue" onPress={() => {
                        toggleOverlay();
                        connectClient(data.length, createRoom);
                    }} buttonStyle={{ backgroundColor: '#2B2D42' }} />
                </View>
            </View>
        </Overlay>
        <FloatingAction
            actions={actions}
            overlayColor='rgba(0, 0, 0, 0.2)'
            color="#2B2D42"
            onPressItem={name => {
                if (name == 'create_room') {
                    if (!server_open && !client_open && !online_open)
                        navigation.navigate('Room');
                    else {
                        showMessage({
                            message: "Cannot Create Room",
                            description: "A room is already active, you have close it before creating a new one.",
                            type: "danger",
                            duration: 3500,
                        })
                    }
                }
                else if(name == "join_room") {
                    if (!server_open && !client_open && !online_open)
                        toggleOverlay();
                    else {
                        showMessage({
                            message: "Cannot Create Room",
                            description: "A room is already active, you have close it before joining a new one.",
                            type: "danger",
                            duration: 3500,
                        })
                    }
                }
                else{
                    if (!server_open && !client_open && !online_open)
                        navigation.navigate('OnlineRoom');
                    else {
                        showMessage({
                            message: "Cannot Go Online",
                            description: "A room is already active, you have close it before going online.",
                            type: "danger",
                            duration: 3500,
                        })
                    }
                }
            }}
        />
    </View>;
};


ChatsScreen.navigationOptions = () => {
    return {
        headerTitle: () => <Text style={styles.headerTextStyle}>ShhTalk</Text>,
        headerStyle: styles.headerStyle,
    };
};

const styles = StyleSheet.create({
    headerStyle: {
        backgroundColor: '#2B2D42',
        height:65
    },
    headerTextStyle: {
        fontSize: 33,
        color:"white",
        // fontWeight: 'bold',
        fontFamily: 'OpenSans-SemiBold'
    },
    container: {
        backgroundColor: "#EDF2F4",
        flex: 1
    },
    textStyle: {
        fontSize: 16,
        fontFamily: 'OpenSans-SemiBold',
        color:"white",
    },
    overlayStyle: {
        // height:'48%',
        width: Dimensions.get('window').width * 0.75,
    },
    overlayText: {
        fontSize: 25,
        fontWeight: 'bold',
        alignSelf: 'center',
        color: '#D90429',
        marginBottom: 10,
    }
});


export default ChatsScreen;

