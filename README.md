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
