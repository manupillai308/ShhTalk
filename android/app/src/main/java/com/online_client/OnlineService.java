package com.online_client;
import android.app.Notification;
import com.shhtalk.R;
import android.app.PendingIntent;
import android.app.Service;
import android.app.ActivityManager;
import android.content.Context;
import android.content.Intent;
import android.os.Handler;
import android.os.IBinder;
import androidx.core.app.NotificationCompat;
import android.app.NotificationManager;
import android.app.NotificationChannel;
import android.os.Build;
import java.net.URISyntaxException;
import java.util.LinkedList;
import java.util.List;
import java.util.NoSuchElementException;

import com.shhtalk.MainActivity;
import io.socket.emitter.Emitter;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.Arguments;
import com.shhtalk.OnlineClientModule;
import org.json.JSONException;
import org.json.JSONObject;
import io.socket.client.Socket;
import io.socket.client.IO;

class SocketInstance{
    private String url;
    private static Socket socket;
    public static Context context;
    public static Notification msg_notification;
    public static NotificationManager notificationManager;


    SocketInstance() throws URISyntaxException{
        IO.Options options = IO.Options.builder().setReconnection(false).build();
        url = "<online-chat-server-url>";
        socket = IO.socket(url, options);
        socket.on(Socket.EVENT_CONNECT, onConnect);
        socket.on(Socket.EVENT_DISCONNECT, onDisconnect);
        socket.on(Socket.EVENT_CONNECT_ERROR, onConnectError);
        socket.on("new message", onMessage);

        socket.connect();

    }
    
    public void sendMsg(ReadableMap data){
        String message;
        message = data.getString("message");
        socket.emit("new message", message); 
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

    public void disconnect(){
        socket.close();
    }

    public void createRoom(String roomname){
        socket.once("room id", onRoomId);

        JSONObject object = new JSONObject();
        try{
            object.put("roomname", roomname);
            socket.emit("create room", object);
        }catch(JSONException e){}
    }

    public void joinRoom(String roomid){
        socket.once("join error", onJoinError);
        socket.once("room id", onRoomId);

        JSONObject object = new JSONObject();
        try{
            object.put("roomid", roomid);
            socket.emit("join room", object);
        }catch(JSONException e){}
    }

    private Emitter.Listener onMessage = new Emitter.Listener(){
        @Override
        public void call(Object... args){
            JSONObject data = (JSONObject) args[0];
            String message, username;
            try{
                username = data.getString("username");
                message = data.getString("message");

                WritableMap params = Arguments.createMap();
                params.putString("username", username);
                params.putString("message", message);
                if(isAppOnForeground())
                    OnlineClientModule.reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                            .emit("message", params);
                else{
                    OnlineService.messages.add(params);
                    SocketInstance.notificationManager.notify(0, SocketInstance.msg_notification);
                }
            }catch(JSONException e){

            }
        }
    };

    private Emitter.Listener onRoomId = new Emitter.Listener(){
        @Override
        public void call(Object... args){
            JSONObject data = (JSONObject) args[0];
            String roomid, username, roomname;
            try{
                roomid = data.getString("roomid");
                username = data.getString("username");
                roomname = data.getString("roomname");

                WritableMap params = Arguments.createMap();
                params.putString("roomid", roomid);
                params.putString("username", username);
                params.putString("roomname", roomname);

                OnlineClientModule.reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit("room-connected", params);
            }catch(JSONException e){

            }
        }
    };

    private Emitter.Listener onJoinError = new Emitter.Listener(){
        @Override
        public void call(Object... args){
            JSONObject data = (JSONObject) args[0];
            String message;
            try{
                message = data.getString("message");

                WritableMap params = Arguments.createMap();
                params.putString("message", message);
                OnlineClientModule.reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit("join-error", params);
            }catch(JSONException e){

            }
        }
    };


    private Emitter.Listener onConnect = new Emitter.Listener(){
        @Override
        public void call(Object... args){
            OnlineClientModule.reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("connect", null);
        }
    };

    private Emitter.Listener onDisconnect = new Emitter.Listener(){
        @Override
        public void call(Object... args){
            OnlineClientModule.reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("disconnect", null);
        }
    };

    private Emitter.Listener onConnectError = new Emitter.Listener(){
        @Override
        public void call(Object... args){
            OnlineClientModule.reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("connect-error", null);
        }
    };

}

public class OnlineService extends Service {

   private static final int SERVICE_NOTIFICATION_ID = 100101;

   private static final String CHANNEL_ID = "online_client";

   public static SocketInstance socket_connection = null;

   public static Boolean isRunning = false;

   public static LinkedList<WritableMap> messages;

   private Handler handler = new Handler();

   private Runnable runnableCode = new Runnable() {

       @Override

       public void run() {
           if(!isRunning){
               try{

                    messages = new LinkedList<WritableMap>();
                    socket_connection = new SocketInstance();
                    SocketInstance.context = getApplicationContext();
                    isRunning = true;
                }catch(URISyntaxException e){
                    OnlineClientModule.reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit("socket-error", null);
                }
           }
       }

   };

   public static void loadMsg(){
        try{
            while(SocketInstance.isAppOnForeground()){
                WritableMap params = messages.pop();
                OnlineClientModule.reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                            .emit("message", params);
            }
        }catch(NoSuchElementException e){

        }catch(Exception e){}
    }

   public static void createRoom(String roomname){
       socket_connection.createRoom(roomname);
   }

   public static void  joinRoom(String roomid){
       socket_connection.joinRoom(roomid);
   }

   public static void  disconnect(){
       try{
            socket_connection.disconnect();
       }catch(Exception e){}
       
       isRunning = false;
       socket_connection = null;
   }

   public static void  sendMsg(ReadableMap object){
        socket_connection.sendMsg(object);
   }

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

       this.disconnect();

       this.handler.removeCallbacks(this.runnableCode);

   }

   @Override

   public int onStartCommand(Intent intent, int flags, int startId) {

       this.handler.post(this.runnableCode);

              // The following code will turn it into a Foreground background process (Status bar notification)

       Intent notificationIntent = new Intent(this, MainActivity.class); 

       PendingIntent contentIntent = PendingIntent.getActivity(this, 0, notificationIntent, PendingIntent.FLAG_CANCEL_CURRENT);

       if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.O){
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, "online client service", NotificationManager.IMPORTANCE_DEFAULT);
            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(channel);

            SocketInstance.msg_notification = new Notification.Builder(this, CHANNEL_ID)
                .setContentTitle("ShhTalk Online")
                .setContentText("You have new messages")
                .setSmallIcon(R.mipmap.ic_launcher) //R.drawable.icon
                .setContentIntent(contentIntent)
                .build();
            SocketInstance.msg_notification.flags |= Notification.FLAG_AUTO_CANCEL;
            
            SocketInstance.notificationManager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);

            Notification notification = new Notification.Builder(this, CHANNEL_ID)
                .setOngoing(true)
                .setContentTitle("ShhTalk Online")
                .setContentText("Room is active..")
                .setSmallIcon(R.mipmap.ic_launcher)
                .build();
            startForeground(SERVICE_NOTIFICATION_ID, notification);
       }else{
            SocketInstance.msg_notification = new NotificationCompat.Builder(this)
                .setContentTitle("ShhTalk Online")
                .setContentText("You have new messages")
                .setSmallIcon(R.mipmap.ic_launcher) //R.drawable.icon
                .setContentIntent(contentIntent)
                .build();
            SocketInstance.msg_notification.flags |= Notification.FLAG_AUTO_CANCEL;
            
            SocketInstance.notificationManager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);

            Notification notification = new NotificationCompat.Builder(this)
                // .setContentIntent(contentIntent)
                .setContentTitle("ShhTalk Online")
                .setContentText("Room is active..")
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .setOngoing(true)
                .build();

            startForeground(SERVICE_NOTIFICATION_ID, notification);
       }
       return START_NOT_STICKY;//START_STICKY_COMPATIBILITY;

   }

}