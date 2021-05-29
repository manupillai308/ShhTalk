package com.shhtalk;

import android.content.Intent;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReadableMap;

import com.facebook.react.bridge.ReactApplicationContext;

import com.facebook.react.bridge.ReactContextBaseJavaModule;

import com.facebook.react.bridge.ReactMethod;
import com.online_client.OnlineService;

import android.util.Log;

import android.os.Build;

import javax.annotation.Nonnull;

public class OnlineClientModule extends ReactContextBaseJavaModule {

   public static final String REACT_CLASS = "OnlineClient";

   public static ReactApplicationContext reactContext;
   public static Boolean running = false;

   public OnlineClientModule(@Nonnull ReactApplicationContext reactContext) {

       super(reactContext);

       OnlineClientModule.reactContext = reactContext;

   }

   @Nonnull

   @Override

   public String getName() {

       return REACT_CLASS;

   }

   @ReactMethod
   public void runningStatus(Promise promise){
          promise.resolve(OnlineClientModule.running);
   }

   @ReactMethod
   public void createRoom(String roomname){
        OnlineService.createRoom(roomname);
   }

   @ReactMethod
   public void joinRoom(String roomid){
        OnlineService.joinRoom(roomid);
   }

   @ReactMethod
   public void disconnect(){
        OnlineService.disconnect();
   }

   @ReactMethod
   public void sendMsg(ReadableMap object){
        OnlineService.sendMsg(object);
   }

   @ReactMethod
   public void loadMsg(){
        OnlineService.loadMsg();
   }

   @ReactMethod
   public void startService() {
    OnlineClientModule.running = true; 

    Intent service = new Intent(OnlineClientModule.reactContext, OnlineService.class);
       if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O){
            OnlineClientModule.reactContext.startForegroundService(service);
       }else{
            OnlineClientModule.reactContext.startService(service);
       }

   }

   @ReactMethod
   public void stopService() {

        OnlineClientModule.reactContext.stopService(new Intent(OnlineClientModule.reactContext, OnlineService.class));
        OnlineClientModule.running = false;
   }

}