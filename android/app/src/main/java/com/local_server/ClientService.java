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
import java.util.Arrays;
import java.util.List;
import java.util.ArrayList;


public class ClientService extends Service {

    public static Socket socket;
    public static String IP_ADDRESS;
    public static DataInputStream din;
    public static DataOutputStream dout;

    private static final int SERVICE_NOTIFICATION_ID = 100100;

    private static final String CHANNEL_ID = "local_client";

    public static void stopClient(){
        try{
            socket.close();
        }catch(Exception e){}
        finally{
            LocalClient.reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("room-lost", null);
        }
    }
    
    private boolean isAppOnForeground() {
        Context context = getApplicationContext();
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

    public static void sendMsg(String msg){
        try{
            dout.writeUTF(msg);
            dout.flush();
        }catch(IOException e){
            stopClient();
        }
    }

    private Runnable runnableCode = new Runnable() {

        @Override
        public void run() {
            try{
                // socket = new Socket(IP_ADDRESS, 6060);
                SocketAddress sockaddr = new InetSocketAddress(IP_ADDRESS, 6060);
                socket = new Socket();
                socket.connect(sockaddr, 3000);
                din = new DataInputStream(socket.getInputStream());
                dout = new DataOutputStream(socket.getOutputStream());
                String handshake = din.readUTF();
                WritableMap params = Arguments.createMap();
                params.putString("payload", handshake);
                LocalClient.reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("client-start", params);
            }catch(Exception e){
                // send server error event
                LocalClient.reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("connection-error", null);
                return;
            }
    
            while(true){
                try{
                    String msg = din.readUTF();
                    if(isAppOnForeground()){
                        WritableMap params = Arguments.createMap();
                        params.putString("payload", msg);
                        LocalClient.reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
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
                }catch(SocketException e){
                    return;
                }catch(IOException e){
                    stopClient();
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
        stopClient();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {

        IP_ADDRESS = intent.getStringExtra("IP_ADDRESS");
        Intent notificationIntent = new Intent(this, MainActivity.class); 

        PendingIntent contentIntent = PendingIntent.getActivity(this, 0, notificationIntent, PendingIntent.FLAG_CANCEL_CURRENT);

        if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.O){
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, "local_client_service", NotificationManager.IMPORTANCE_LOW);
            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(channel);

            Notification notification = new Notification.Builder(this, CHANNEL_ID)
            // .setContentIntent(contentIntent)
            .setOngoing(true)
            .setContentTitle("ShhTalk")
            .setContentText("Connected to Room..")
            .setSmallIcon(R.mipmap.ic_launcher)
            .build();
            startForeground(SERVICE_NOTIFICATION_ID, notification);
        }else{
            Notification notification = new NotificationCompat.Builder(this)
                // .setContentIntent(contentIntent)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle("ShhTalk")
                .setContentText("Connected to Room..")
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