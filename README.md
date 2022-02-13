# gimp-server

A Node server that handles requests from the group ironman plugin ([GIMP](https://github.com/davidvorona/gim-plugin)).

## Public Server

There is now a public server that any group can connect to! Performance *may* be affected
because anyone can connect to it, but it should be good enough for most users.

**The address for the public server is https://gimp-server.herokuapp.com; simply copy it into the server address config
field and you're all set!**

*DISCLAIMER: using our public server involves submitting your IP address to a 3rd party server maintained by myself.
The server keeps a copy of relevant character data and that's it--if this is unacceptable to you, the server is open-source
and you are welcome to host it yourself (see below).*

## Host It Yourself

### Setup

The only setup required is the [installation of the Node.js runtime](https://nodejs.org/en/download/) on the machine that will run the server.

### Usage

Because multiple clients will be connecting to this server, it is recommended you either host it using a
dedicated hosting service, such as AWS or Heroku, or run it on a local device you intend to leave on - like a raspberry pi.

Whether you are on a local machine or connected to a hosted one, you must:

1. Clone the repository
2. Install the dependencies: `npm install`
3. Run the server: `npm start`

At this point your server will be listening at the IP of the machine running it and at a port specified by your host, falling back on port `3000`. For hosted servers, there should be a public address exposed for your app: use this value for the server address in the plugin config for each client. *If there is no public address or domain, you will have to specify the IP and port.* Refer to the special instructions below.

#### Local machine

For other clients to connect to a server running on your local network, you must forward the port `3000` at the internal IP address of the machine running the server. At this point, clients can set their address in the plugin config to the address composed of the public IP and externalized port:

```
Server Address: {PUBLIC_IP}:{PUBLIC_PORT}
```

*Certain hosted servers that don't expose a public address or domain for your app may require building the address like is done above using a provided IP and port.*