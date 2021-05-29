import React, {useEffect, useContext} from 'react';
import { Context as DataContext } from '../contexts/DataContext';
import OnlineClient from '../../OnlineClient';
import LocalClient from '../../LocalClient';
import LocalServer from '../../LocalServer';
import { Context as ClientDataContext } from '../contexts/ClientDataContext';
import { Context as ServerDataContext } from '../contexts/ServerDataContext';
import { Context as OnlineClientContext } from '../contexts/OnlineClientContext';


const InitScreen = ({navigation}) => {
    const {loadData} = useContext(DataContext);
    const {loadConfig: server_loadConfig } = useContext(ServerDataContext);
    const {loadConfig: client_loadConfig } = useContext(ClientDataContext);
    const {loadConfig: online_loadConfig } = useContext(OnlineClientContext);
    useEffect(async () => {
        try{
            const isServer = await LocalServer.runningStatus();
            if(isServer)
                await server_loadConfig();

            const isClient = await LocalClient.runningStatus();
            if(isClient)
                await client_loadConfig();

            const isOnline = await OnlineClient.runningStatus();
            if(isOnline)
                await online_loadConfig();
            
            await loadData();
            navigation.navigate("Chats");
        }catch(e){}
    }, []);
    return null;
}


export default InitScreen;
    