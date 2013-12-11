### Forum/BulletinBoard Url Redirector

Quick and dirty solution to redirect a migrated forum Topics/Forums/Users URLs to another.

### Map

You must create/generate a map of the __source__ topics/forums/users ids, I've created a [sample](map.sample.json)
which is portion of a previous migrated site.
The sample assumes that
* the old site live at example.com/forums
* hence all the old paths are prefixed with `/forums`
* the new forum live at `forums.example.com`
* __forums__ is now known by __category__

(it was basically a [UBB](http://www.ubbcentral.com/) forum wich was migrated to [NodeBB](http://nodebb.org/)
but the redirect would work for almost any other map-redirecting needs)


### Install

```bash

git clone https://github.com/akhoury/RedirectBB.git
cd RedirectBB

# install dependencies
npm install

# I would use 'forever' or 'supervisor' to keep it running
sudo npm install -g forever

forever -o out.log redirect.js --map="map.sample.json" --port=3000 --host=127.0.0.1 --verbose

# or simply, for a quick demo, and it will default to values used one line above. minus the -v flag :)
node redirect.js  -v

```

### Map

I can't neatly comment a json file, so I will here
```
 {
 		// are you redirecting to a new URL, no? leave it blank
         "newRootUrl": "forums.example.com",

          // the redirect logic will pathname.indexOF() the values in the startWith array
          // if there is match, it will look for the next '/' i.e. /forums/topics/123/blablabla
          // it will append the /value/ to the startWith[i] matched value, i.e. /forums/topics/123 then try to match it in the paths Map
          // if there isnt a next '/' it will append the whole post fix, /forums/topics/123
          // if there is no statWith match at all, it would still try to find a match in the map, probably one for the hardcoded ones below
		  // if that doesn't work, it will redirect to the newRootUrl or '/' if there isn't one set

         "startWith": [
                 "/forums/topics/",
                 "/forums/forums/",
                 "/forums/users/"
         ],

         "paths": {

						 // these are basically the large portion
						 // with dynamic values

                         "/forums/ubbthreads.php/topics/123": "/topic/321",
                         "/forums/ubbthreads.php/topics/456": "/topic/654",
                         "/forums/ubbthreads.php/topics/789": "/topic/987",

                         "/forums/ubbthreads.php/users/123": "/user/321",
                         "/forums/ubbthreads.php/users/456": "/user/654",
                         "/forums/ubbthreads.php/users/789": "/user/987",

                         "/forums/ubbthreads.php/forums/123": "/category/321",
                         "/forums/ubbthreads.php/forums/456": "/category/654",
                         "/forums/ubbthreads.php/forums/789": "/category/987"


                        // you might have a few to hardcode

                         "/forums/ubb/login":"/login",
                         "/forums/ubb/newuser":"/register",
                         "/forums/ubbthreads/newuser": "/register",
                         "/forums/ubbthreads/login": "/login",


         }
 }
```

### Required Nginx setup

see [nginx.example.com](nginx.example.com) to view an example on the setup I needed,
basically the old UBB forum lived under example.com/forums, so I have a location /forums directive in
 nginx to handle all request into that, which just proxies the requests to RedirectBB for it to handle the logic

#### Note:

Notice in [nginx.example.com] how I kept the `/forums/images` pointing to the same dir, and not being handled by this redirector,
since I wanted the old users to keep their uploaded images and avatar working.

### Migrator?

if you decide to migrate to [NodeBB](http://nodebb.org/) give this [nodebb-plugin-import](https://github.com/akhoury/nodebb-plugin-import) a shot.
I also added [nginx.forums.example.com](nginx.forums.example.com) which proxies the requests to NodeBB's process.
