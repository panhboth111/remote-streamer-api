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

| Type |    Route     |           Body |                 Response                  |
| ---- | :----------: | -------------: | :---------------------------------------: |
| POST | /auth/signUp | email,name,pwd | message:string or err:any, errCode:string |
| POST | /auth/signIn |      email,pwd | message:any,success:boolean,token:string  |

### User
