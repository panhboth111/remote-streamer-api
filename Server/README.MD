# Remote Streamer Server API

## Installation steps

1. Clone the repository

...`git clone link_here`

2. install dependencies

...`npm i or npm install`

3. Make sure you have gpp or gcc (C/C++ build tools).
   > This is so that you can use bcrypt
   > On Linux, run `sudo apt-get build-essentials`
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
| POST | /user/changeProfile |                          {newProfile} | Token  | {message:string,success:boolean}                                                                      |
| POST |  /user/changeCover  |                            {newCover} | Token  | {message:string,success:boolean}                                                                      |
