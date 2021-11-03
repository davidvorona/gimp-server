# gimp-server

A Node server that handles requests from the group ironman plugin ([GIMP](https://github.com/davidvorona/gim-plugin)).

## Setup

The only setup required is the [installation of the Node.js runtime](https://nodejs.org/en/download/) on the machine that will run the server.

## Usage

Because multiple clients will be connecting to this server, it is recommended you either host it using a
dedicated hosting service, such as AWS or Heroku, or run it on a local device you intend to leave on - like a raspberry pi.

Whether you are on a local machine or connected to a hosted one, you must:

1. Clone the repository
2. Install the dependencies: `npm install`
3. Run the server: `npm start`

At this point your server will be listening at the IP of the machine running it, and on port `3000`. For hosted servers, this IP and port will be the values entered in the plugin settings for each client. If you are running it on a local machine, refer to the special instructions below.

### Local machine

For other clients to connect to a server running on your local network, you must forward the port `3000` at the internal IP address of the machine running the server. At this point, clients can set their IP and port in the plugin settings to the public IP and externalized port.
