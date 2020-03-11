# Remote Streamer Server API

## Installation steps

1. Clone the repository

...`git clone link_here`

2. install dependencies

...`npm i or npm install`

3. Make sure you have gpp or gcc (C/C++ build tools).
   > This is so that you can use bcrypt
   > On Linux, run `apt-get install build-essential`
   > On Windows, download and install the tools mentioned above
   > If there is still some errors regarding bcrypt, run `npm uninstall bcrypt` then `npm i bcrypt`

## API GUIDES

### Authentication

| Type |    Route     |                                  Body |                  Response                   |
| ---- | :----------: | ------------------------------------: | :-----------------------------------------: |
| POST | /auth/signUp | {email:string,name:string,pwd:string} | {message:string or err:any, errCode:string} |
| POST | /auth/signIn |             {email:string,pwd:string} | {message:any,success:boolean,token:string}  |

### User

| Type |        Route        |                                  Body | Header | Response                                                                                              |
| ---- | :-----------------: | ------------------------------------: | :----: | ----------------------------------------------------------------------------------------------------- |
| GET  |   /user/allUsers    |                                  NONE | Token  | Array of {email:string,name:string,role:string,isStreaming:boolean,profilePic:string,coverPic:string} |
| GET  |     /user/user      |                                  NONE | Token  | {email:string,name:string,role:string}                                                                |
| GET  |  /user/userHistory  |                                  NONE | Token  | {message:any,success:boolean}                                                                         |
| POST |  /user/changeRole   | {targetUser:string,targetRole:string} | Token  | {message:string,errCode?:any}                                                                         |
| POST | /user/changeProfile |                   {newProfile:string} | Token  | {message:string,success:boolean}                                                                      |
| POST |  /user/changeCover  |                     {newCover:string} | Token  | {message:string,success:boolean}                                                                      |
|  |
| POST |  /user/changeCover  |                     {newCover:string} | Token  | {message:string,success:boolean}                                                                      |
| POST |  /user/changeName   |         {name:string,password:String} | Token  | {message:string,errCode?:boolean}                                                                     |

### Streams

| Type |            Route            |                                                                                        Body | Header | Response                                                                                                                                                                                         |
| ---- | :-------------------------: | ------------------------------------------------------------------------------------------: | :----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| POST |    /streams/startStream     | {streamTitle:string,description:string,isPrivate:boolean,password?:string,thumbnail:string} | Token  | {streamCode:string,title:string,description:string}                                                                                                                                              |
| POST | /streams/deviceStartStream  | {streamTitle:string,description:string,isPrivate:boolean,password?:string,thumbnail:string} | Token  | {email:string,name:string,role:string}                                                                                                                                                           |
| POST |     /streams/jointream      |                                                        {streamCode:string,password?:string} | Token  | {options:object,domain:string,role:string,name:string} or {message:any,errCode:any}                                                                                                              |
| POST |     /streams/stopStream     |                                                                                        NONE | Token  | {message:string,status:boolean}                                                                                                                                                                  |
| POST | /streams/getCurrentlyStream |                                                               {limit:string,status:boolean} | Token  | Array of {streamCode:string,streamTitle:string,description:string,thumbnail:string,isPrivate:boolean,password:string,owner:string,ownerName:string,date:Date,isActive:boolean,streamFrom:string} |
| POST |  /streams/adminStopStream   |                                                                         {streamCode:string} | Token  | {message:string,errCode:string}                                                                                                                                                                  |
|  |
| POST |     /streams/editStream     |                               { streamCode:string, streamTitle:string, description:string } | Token  | {message:string,errCode?:boolean}                                                                                                                                                                |
| POST |  /streams/getStreamDetail   |                                                                         {streamCode:string} | Token  | {                                                                                                                                                                                                |

          streamCode: string,
          streamTitle: string,
          description: string,
          ownerName: string
        }|
