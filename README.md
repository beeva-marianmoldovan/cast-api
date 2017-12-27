## Cast API. A service to detect and send content to Chromecast devices

### Install
`npm install`

### Usage
* Start the server `node index.js`
* Get available devices: `curl localhost:3000/screens`. You should get a response like:
```
[
    {
        "host": "59d44c16-d6a2-137c-50d0-1a31dd735201.local",
        "port": 8009,
        "address": "192.168.52.50",
        "name": "Showroom.1"
    }
]
```
* Send content to the devices. Right now we support the content types: `image`,`video`,`youtube` and `web`. And the request is a POST to `curl localhost:3000/content` with the following JSON format:
```
{
	"screen": "labs.2",
	"type":"youtube",
	"content":"https://www.youtube.com/watch?v=5ZEmbbQJgtk"
}
```
Screen is the name of the Chromecast (which you can get to know with the other endpoint). Type is one of the available content types: `image`,`video`,`youtube` and `web` and content makes for the URL of the video/image/whatever.

## Deploy to RaspberryPi
We use a RaspberryPi 3 + Resin.io to deploy the service and have it constantly running. The resin.io service provides an external IP through a Ngrok tunnel. So you can access the API from everywhere. We provide the necessary [Dockerfile](https://github.com/beeva-marianmoldovan/cast-api/blob/master/Dockerfile) in the folder.
