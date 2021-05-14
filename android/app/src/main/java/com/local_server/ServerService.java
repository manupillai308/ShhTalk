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
import java.text.SimpleDateFormat;
import java.net.*;
import java.io.*;
import java.util.*;
import java.nio.charset.*;
import java.util.concurrent.locks.ReentrantLock;
import java.util.LinkedList;
import java.lang.Thread;
import java.util.Arrays;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.ArrayList;
import java.util.concurrent.ThreadLocalRandom;
import android.util.Log;

class ClientConnection extends Thread{
    DataInputStream data_in;
    DataOutputStream data_out;
    public Socket socket;
    public volatile boolean exit;
    public boolean proxy;
    String clientName;
    public static Context context;

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
        write("{ \"user\": \"" + clientName + "\", \"title\": \"" + LocalServer.title + "\" }");

        String msg = "{\"id\": \"" + getUniqueId() + "\", \"date\": \""+ getCurrentTime() + "\", \"type\":\"system\",  \"message\": \"joined the chat\", \"user\": \"" + clientName + "\"}";
        if(isAppOnForeground()){
            WritableMap params = Arguments.createMap();
            params.putString("name", clientName);
            params.putString("address", socket.getInetAddress().toString());
            LocalServer.reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit("client-connect", params);
        }else{
            ServerService.messages.add(msg);
        }
        
        ServerService.lock.lock();
        ServerService.broadcastMsg(socket.getInetAddress().toString(), msg);
        ServerService.lock.unlock();
        exit = false;
    }

    static String getCurrentTime(){

        SimpleDateFormat df = new SimpleDateFormat("HH:mm aa");
        String  currentTime = df.format(Calendar.getInstance().getTime());
        return currentTime.replace("AM", "am").replace("PM","pm");
    }

    static String getUniqueId(){
        byte[] array = new byte[256];
        int n = 7;
        new Random().nextBytes(array);
  
        String randomString
            = new String(array, Charset.forName("UTF-8"));
  
        StringBuffer r = new StringBuffer();
  
        String  AlphaNumericString
            = randomString
                  .replaceAll("[^A-Za-z0-9]", "");

        for (int k = 0; k < AlphaNumericString.length(); k++) {
  
            if (Character.isLetter(AlphaNumericString.charAt(k))
                    && (n > 0)
                || Character.isDigit(AlphaNumericString.charAt(k))
                       && (n > 0)) {
  
                r.append(AlphaNumericString.charAt(k));
                n--;
            }
        }
        return r.toString();
    }
  


    public void write(String msg) throws IOException{
        data_out.writeUTF(msg);
        data_out.flush();
    }

    public String read() throws IOException{
        return data_in.readUTF();
    }

    public static boolean isAppOnForeground() {
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
                else{
                    ServerService.messages.add(msg);
                }
                ServerService.lock.lock();
                ServerService.broadcastMsg(this.socket.getInetAddress().toString(), msg);
                ServerService.lock.unlock();
            } catch (Exception e) {
                // Log.e("server-service", e.getMessage());
                break;
            }
        }
        stopClient();
    }

    public void stopClient(){
        exit = true;
        try{
            String msg = "{\"id\": \"" + getUniqueId() + "\", \"date\": \""+ getCurrentTime() + "\", \"type\":\"system\",  \"message\": \"left the chat\", \"user\": \"" + clientName + "\"}";
            if(isAppOnForeground()){
                WritableMap params = Arguments.createMap();
                params.putString("name", clientName);
                params.putString("address", this.socket.getInetAddress().toString());
                LocalServer.reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("client-disconnect", params);
            }else{
                ServerService.messages.add(msg);
            }
            ServerService.lock.lock();
            ServerService.broadcastMsg(this.socket.getInetAddress().toString(), msg);
            ServerService.lock.unlock();
            
            socket.close();
            data_in.close();
            data_out.close();
        }catch(Exception e){}
        finally{
            ServerService.clients.remove(this);
        }
    }
    public void stopClientSilent(){
        exit = true;
        try{
            socket.close();
            data_in.close();
            data_out.close();
        }catch(Exception e){}
    }
}

public class ServerService extends Service {
    public static ReentrantLock lock;
    public static LinkedList<ClientConnection> clients;
    public static LinkedList<String> messages;
    public static volatile boolean exit;
    public static ServerSocket socket;
    public static ArrayList<String> names;

    private static final int SERVICE_NOTIFICATION_ID = 100100;

    private static final String CHANNEL_ID = "local_server";

    public static void loadMsg(){
        try{
            while(ClientConnection.isAppOnForeground()){
                String msg = messages.pop();
                WritableMap params = Arguments.createMap();
                params.putString("payload", msg);
                LocalServer.reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("message",params);
            }
        }catch(NoSuchElementException e){

        }catch(Exception e){}
    }

    public void stopServer(){
        try{
            // Context context = getApplicationContext();
            socket.close();
        }catch(Exception e){}
        finally{
            try{
                while(true){
                    ClientConnection client = clients.pop();
                    client.stopClientSilent();
                }
            }catch(NoSuchElementException e){}
            LocalServer.reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("server-close", null);
        }
    }

    public static void broadcastMsg(String from, String msg){
        for(int i=0; i < clients.size(); i++){
            ClientConnection client = clients.get(i);
            try{
                String to = client.socket.getInetAddress().toString();
                if(!from.equals(to)){
                        client.write(msg);
                }
            }catch(IOException e){
                client.stopClient();
            }
        }

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
            messages = new LinkedList<String>();

            try{
                socket = new ServerSocket(6060);
                String name = getClientName();
                WritableMap params = Arguments.createMap();
                params.putString("payload", name);
                LocalServer.reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("server-start", params);
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