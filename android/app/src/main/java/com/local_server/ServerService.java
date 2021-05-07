package com.local_server;
import android.app.Notification;
import com.shhtalk.R;
import android.app.PendingIntent;
import android.app.Service;
import android.app.ActivityManager;
import android.content.Context;
import android.content.Intent;
import android.os.IBinder;
import androidx.core.app.NotificationCompat;
import android.app.NotificationManager;
import android.app.NotificationChannel;
import android.os.Build;
import android.os.Bundle;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.HeadlessJsTaskService;
import com.shhtalk.MainActivity;
import java.lang.Thread;
import java.net.*;
import java.io.*;
import java.util.concurrent.locks.ReentrantLock;
import java.util.LinkedList;
import java.lang.Thread;
import java.util.Arrays;
import java.util.List;
import java.util.ArrayList;
import java.util.concurrent.ThreadLocalRandom;

class ClientConnection extends Thread{
    DataInputStream data_in;
    DataOutputStream data_out;
    public Socket socket;
    public volatile boolean exit;
    public boolean proxy;
    String clientName;
    static Context context;

    ClientConnection(){
        proxy = true;
    }

    ClientConnection(String name, Socket s) throws IOException{
        super();
        proxy = false;
        // context = c;
        socket = s;
        clientName = name;
        data_in = new DataInputStream(socket.getInputStream());
        data_out = new DataOutputStream(socket.getOutputStream());
        write(clientName);

        WritableMap params = Arguments.createMap();
        params.putString("payload", clientName);
        LocalServer.reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit("client-connect", params);
        
            exit = false;
    }
    public void write(String msg) throws IOException{
        data_out.writeUTF(msg);
        data_out.flush();
    }

    public String read() throws IOException{
        return data_in.readUTF();
    }

    private boolean isAppOnForeground() {
        ActivityManager activityManager = (ActivityManager) context.getSystemService(Context.ACTIVITY_SERVICE);
        List<ActivityManager.RunningAppProcessInfo> appProcesses = activityManager.getRunningAppProcesses();
        if (appProcesses == null) {
            return false;
        }
        final String packageName = context.getPackageName();
        for (ActivityManager.RunningAppProcessInfo appProcess : appProcesses) {
            if (appProcess.importance ==
            ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND &&
             appProcess.processName.equals(packageName)) {
                return true;
            }
        }
        return false;
    }

    @Override
    public void run(){
        while (!exit) {
            try {
                String msg = this.read();
                if(isAppOnForeground()){
                    
                    WritableMap params = Arguments.createMap();
                    params.putString("payload", msg);
                    LocalServer.reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("message",params);

                }
                // else{
                //     Intent js_service = new Intent(context, HeadlessUpdateService.class);
                //     Bundle bundle = new Bundle();

                //     bundle.putString("payload", msg);
                //     js_service.putExtras(bundle);

                //     context.startService(js_service);
                //     HeadlessJsTaskService.acquireWakeLockNow(context);
                // }
                ServerService.lock.lock();
                ServerService.broadcastMsg(this, msg);
                ServerService.lock.unlock();
            } catch (Exception e) {
                break;
            }
        }
        stopClient();
    }

    public void stopClient(){
        exit = true;
        try{
            
            WritableMap params = Arguments.createMap();
            params.putString("payload", clientName);
            LocalServer.reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("client-disconnect", params);
            
                data_in.close();
            data_out.close();
            socket.close();
            ServerService.clients.remove(this);
        }catch(Exception e){}
    }
}

public class ServerService extends Service {
    public static ReentrantLock lock;
    public static LinkedList<ClientConnection> clients;
    public static volatile boolean exit;
    public static ServerSocket socket;
    public static ArrayList<String> names;

    private static final int SERVICE_NOTIFICATION_ID = 100100;

    private static final String CHANNEL_ID = "local_server";

    public void stopServer(){
        try{
            // Context context = getApplicationContext();
            socket.close();
            LocalServer.reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("server-disconnect", null);
        }catch(Exception e){}
    }

    public static void broadcastMsg(ClientConnection c, String msg){
        String from;
        if(!c.proxy) from = c.socket.getInetAddress().toString();
        else from = " ";
        for(int i=0; i < clients.size(); i++){
            ClientConnection client = clients.get(i);
            try{
                InetAddress to = client.socket.getInetAddress();
                if(c.proxy || !from.equals(to)){
                        client.write(msg);
                }
            }catch(IOException e){
                client.stopClient();
            }
        }

    }

    public static void broadcastMsg(String msg){
        broadcastMsg(new ClientConnection(), msg);
    }

    private String getClientName(){
        int ix = ThreadLocalRandom.current().nextInt(names.size());
        String name = names.get(ix);
        names.remove(ix);
        return name;
    }
    private Runnable runnableCode = new Runnable() {

        @Override
        public void run() {
            names = new ArrayList<String>(Arrays.asList("Sansa","Mowgli","Cricket","Banjo","Diezel Ky","Kal-El","Satchel","Egypt"," Buddy Bear",
            "Tiamii","Bluebell Madonna","Fifibelle","Apple","Destry","Tu Morrow","North","Sunday","Jermajesty",
            "Tokyo","Levaeh","Adeline","Audi","Alucard","Sparrow","Correspondent","Seven","Puma","Camera","Bandit",
            "Hashtag","Facebook","Mustard","Cherry","Summer Rain","River Rose","Nutella","Daisy Boo","Free","Megaa Omari"));

            lock = new ReentrantLock();
            clients = new LinkedList<ClientConnection>();

            try{
                socket = new ServerSocket(6060);
                String name = getClientName();
                WritableMap params = Arguments.createMap();
                params.putString("payload", name);
                LocalServer.reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("server-success", params);
            }catch(IOException e){
                // send server error event
                LocalServer.reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("server-error", null);
                return;
            }
    
            while(true){
                try{
                    Socket s = socket.accept();
                    ClientConnection.context = getApplicationContext();
                    String name = getClientName();
                    ClientConnection c = new ClientConnection(name, s);
                    clients.add(c);
                    clients.getLast().start();
                }catch(SocketException e){
                    return;
                }catch(IOException e){
                    stopServer();
                    return;
                }
            }
        }

    };

    @Override
    public IBinder onBind(Intent intent) {

        return null;
    }

    @Override

    public void onCreate() {

        super.onCreate();
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        stopServer();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        
        Intent notificationIntent = new Intent(this, MainActivity.class); 

        PendingIntent contentIntent = PendingIntent.getActivity(this, 0, notificationIntent, PendingIntent.FLAG_CANCEL_CURRENT);

        if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.O){
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, "local_server_service", NotificationManager.IMPORTANCE_LOW);
            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(channel);

            Notification notification = new Notification.Builder(this, CHANNEL_ID)
            // .setContentIntent(contentIntent)
            .setOngoing(true)
            .setContentTitle("ShhTalk")
            .setContentText("Room is active..")
            .setSmallIcon(R.mipmap.ic_launcher)
            .build();
            startForeground(SERVICE_NOTIFICATION_ID, notification);
        }else{
            Notification notification = new NotificationCompat.Builder(this)
                // .setContentIntent(contentIntent)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle("ShhTalk")
                .setContentText("Room is active..")
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .setOngoing(true)
                .build();

            startForeground(SERVICE_NOTIFICATION_ID, notification);
        }

        Thread t = new Thread(this.runnableCode);
        t.start();
        return START_NOT_STICKY;

    }
}