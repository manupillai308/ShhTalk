# ShhTalk
The entire codebase for the Anonymous Group Chat android application [ShhTalk](https://play.google.com/store/apps/details?id=com.shhtalk).

## About

**shhTalk** lets you create an anonymous group chatroom over your WIFI hotspot or across the internet. All you need is some friends and all they need is your hotspot connection (dont need to share the internet) if using offline room functionality.
For creating online chatrooms, you can use the "Go Online" functionality within the application.

Sounds interesting right? Check it out.

## How to get started (Application Usage)

The mobile application can be installed from [Google PlayStore](https://play.google.com/store/apps/details?id=com.shhtalk).

### Creating & Joining Room (Offline)

1) Joining an offline room - To join a friend's room, connect your phone to their WIFI hotspot. Then come back to shhTalk and press the "+" icon at the bottom right corner and select "Join a Room". Voila, thats it, you have automatically joined your friend's room.

2) Creating an offline room - To create a room, first turn on your WIFI hotspot. Then come back to shhTalk and press the "+" icon at the bottom right corner and select "Create a Room", enter a funny room name of your choice and press go. You have sucessfully created a room, just let your friends connect to your hotspot (Don't need to share your internet ;-) ) and follow instruction (1), they will automatically join the room.

### Creating & Joining Room (Online)
Creating and Joining online rooms are as easy as it seems, just press the "+" icon at the bottom right corner and select "Go Online". There you will have option to Join or Create a room.
For creating a room, you have to enter your desired room name and continue, once the room is created, you will be redirected to the room's chat window where you will see a 6 digit joining (room) code or Id as we like to call it.
Share this 6 digit code with anyone who wants to join your room, once they get to the "Go Online" screen, they will be prompted to enter this 6 digit id to join into your room.

Enjoy.... & keep shhhhinggg!!


## For Developers
The application is built using React Native. The packages required are listed below. The offline chat feature is implemented using TCP Sockets and the online chat feature is implemented using WebSockets. 
It should be noted that both of these are implemented in the native side, i.e Java Source Files and the application implements foreground services for all its functionalities. The communication between the Native and React Native is done using event emiiters and Native Modules, and listeners are implemented in the react native side for reacting to certain native side events.
More on this can be found in the official [React Native Docs](https://reactnative.dev/docs/native-modules-intro). 

#### Extras

A [stackoverflow answer](https://stackoverflow.com/a/66944348/9748372) for the implementation detail on TCP Socket for offline aka chatting through wifi hotspot.


### Dependencies

#### React Native Major Deps
* [react-native-elements@3.4.1](https://reactnativeelements.com/docs)
* [react-native-flash-message@0.1.23](https://www.npmjs.com/package/react-native-flash-message)
* [react-native-floating-action@1.21.0](https://www.npmjs.com/package/react-native-floating-action)
* [react-native-network-info@5.2.1](https://www.npmjs.com/package/react-native-network-info)
* [react-navigation@4.4.4](https://reactnavigation.org/docs/4.x/getting-started)

#### Native Side Deps (Java)
* [Socket IO](https://socketio.github.io/socket.io-client-java/installation.html)


### ShhTalk-Online

The online chat room feature enables shhTalk users to create anonymous group chat rooms over the internet. The functionality is implemented using SocketIO. A server is hosted over the internet that the mobile application(Java Client) connects to (following a WebSocket Protocol), which handles the communication between multiple connected clients, like exchanging messages and alerting users in a group chat about certain events e.g a user leaving or joining the group.
The server is implemented in Node.js and the codebase can be found [here](https://github.com/manupillai308/ShhTalk-Server).

**It must be noted that the actual server address that the application(in production) uses is ommited from this codebase and developers compiling/using the code is requested to update it with their hosted server address**. 
The file responsible for the same is ```/android/app/src/main/java/com/online_client/OnlineService.java```.
```java
// On Line Number 42
IO.Options options = IO.Options.builder().setReconnection(false).build();
        url = "<online-chat-server-url>"; // Set url to the hosted server url
        socket = IO.socket(url, options);
```
## License

This project is licensed under the terms of the GNU General Public License v3.0. See the [LICENSE](/LICENSE.md) file for license rights and limitations.

## Acknowledgement

This entire project took me around a month to complete and me being not from a development background was only able to fulfill this because of the ingenious and selfless support of the community and many open source intiatives. 
During the entire building phase, I stumbled across a lot of issues that I was able to solve only because of the power of open source collaboratiions and the love of sharing knowledge in the community.

I sincerely thank every one of those unknown people, whose codebase, modules, packages, answers, suggestions, hints I used to accomplish this project of mine. 


I wish all of you enjoy using ShhTalk as much as I enjoyed building it :heart:



