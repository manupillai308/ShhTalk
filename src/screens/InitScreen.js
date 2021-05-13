import React, {useEffect, useContext} from 'react';
import { Context as DataContext } from '../contexts/DataContext';
import { Context as ClientDataContext } from '../contexts/ClientDataContext';
import { Context as ServerDataContext } from '../contexts/ServerDataContext';


const InitScreen = ({navigation}) => {
    const {loadData} = useContext(DataContext);
    const {loadConfig: server_loadConfig } = useContext(ServerDataContext);
    const {loadConfig: client_loadConfig } = useContext(ClientDataContext);
    useEffect(async () => {
        try{
            await server_loadConfig();
            await client_loadConfig();
            await loadData();
            navigation.navigate("Chats");
        }catch(e){}
    }, []);
    return null;
}


export default InitScreen;
    