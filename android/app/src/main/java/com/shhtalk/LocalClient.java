package com.local_server; 
import java.util.Map;
import java.util.HashMap;
import java.lang.Object;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.local_server.ClientService;
import com.facebook.react.bridge.Callback;
import android.os.Build;
import android.content.Intent;

public class LocalClient extends ReactContextBaseJavaModule {
    public static ReactApplicationContext reactContext;
    public static Boolean running = false;

    LocalClient(ReactApplicationContext context) {
       super(context);
       LocalClient.reactContext = context;
   }
   @Override
   public String getName(){
       return "LocalClient";
   }

   @ReactMethod
   public void runningStatus(Promise promise){
          promise.resolve(LocalClient.running);
   }

   @ReactMethod
   public void startClient(String ip){
        LocalClient.running = true;
        Intent service = new Intent(LocalClient.reactContext, ClientService.class);
        service.putExtra("IP_ADDRESS", ip);
        // ClientService.IP_ADDRESS = ip;  
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O){
            LocalClient.reactContext.startForegroundService(service);
        }else{
            LocalClient.reactContext.startService(service);
        }
    }

    @ReactMethod
    public void stopClient(){
 
        LocalClient.reactContext
         .stopService(new Intent(LocalClient.reactContext, ClientService.class));
        
        LocalClient.running = false;
 
    }

    @ReactMethod
    public void loadMsg(){
        ClientService.loadMsg();
    }

    @ReactMethod
    public void sendMsg(String msg){
        ClientService.sendMsg(msg);
    }
}
