# sound9  
Music player site with Web3 login  

# Demo  
[Demo here with some sample music from Pixbay](https://sound9.electricfur.energy/#/)  
Demo is set up with read rights for new users  

## ENV Variables you need to set  
```bash
MONGO_CONNECTION_STRING 
// The connection string of your MongoDb instance
// Defaults to: 'mongodb://admin:password@localhost:27017/sound9?authSource=admin'

ADMIN_WALLET_ADDRESS
// The ethereum wallet address of the user that will be give admin privileges of this instance  
```

## Optional ENV variables
```bash
PORT
// The port the server runs on, defaults to 5000
    
SECRET_JWT_KEY
// The JWT secret, defaults to a random string on each startup
// You can set this to a static string will prevent users from being logged out after server restarts 

COOKIE_TIMEOUT
// Cookie expiration in milliseconds
// Defaults to 30 days ( 30*24*60*60*1000 )
}
```  

## Images  
![playlist](https://github.com/studiefredfredrik/sound9/blob/main/imgs/playlist.png?raw=true "Playlist")  
![delete](https://github.com/studiefredfredrik/sound9/blob/main/imgs/delete.png?raw=true "Delete files")  
![favorites](https://github.com/studiefredfredrik/sound9/blob/main/imgs/favorites.png?raw=true "Favorites")  
![admin](https://github.com/studiefredfredrik/sound9/blob/main/imgs/admin.png?raw=true "Admin page")  
![search](https://github.com/studiefredfredrik/sound9/blob/main/imgs/search.png?raw=true "Search")  
![upload](https://github.com/studiefredfredrik/sound9/blob/main/imgs/upload.png?raw=true "Upload")  
![upload-edit](https://github.com/studiefredfredrik/sound9/blob/main/imgs/upload-edit.png?raw=true "Upload edit")  


## Roadmap
- Uploaded music saved in MongoDb ✔
- Multiple users, shared library  ✔
- Upload mp3's manually ✔
- Admin UI to manage users ✔
- Compatible with car stereo / bluetooth controls (skip, pause etc.) ✔
- Auto rip from a YouTube playlist
- Send magic links for file play
- Embed player support
- Manually rip music from YouTube  
