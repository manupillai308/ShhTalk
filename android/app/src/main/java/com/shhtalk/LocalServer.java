package com.local_server; 
import java.util.Map;
import java.util.HashMap;
import java.lang.Object;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;
import com.local_server.ServerService;
import android.os.Build;
import android.content.Intent;

public class LocalServer extends ReactContextBaseJavaModule {
    public static ReactApplicationContext reactContext;
    public static String title;

    LocalServer(ReactApplicationContext context) {
       super(context);
       LocalServer.reactContext = context;
   }
   @Override
   public String getName(){
       return "LocalServer";
   }

   @ReactMethod
   public void startServer(String room_name){
        LocalServer.title = room_name;
        Intent service = new Intent(LocalServer.reactContext, ServerService.class);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O){
                LocalServer.reactContext.startForegroundService(service);
        }else{
                LocalServer.reactContext.startService(service);
        }
    }

    @ReactMethod
    public void stopServer(){
 
        LocalServer.reactContext
         .stopService(new Intent(LocalServer.reactContext, ServerService.class));
 
    }

    @ReactMethod
    public void loadMsg(){
        ServerService.loadMsg();
    }

    @ReactMethod
    public void sendMsg(String from, String msg){
        ServerService.lock.lock();
        ServerService.broadcastMsg(from, msg);
        ServerService.lock.unlock();
    }
}
