# F-block-programming
### Procedural programming with visual function blocks

Inspired by Function Block Diagram programming used in industrial PLCs.

Inspired by and prototyped on Node-RED (http://nodered.org)

Intended ultimately for Raspberry Pi, BeagleBone, etc.

![image](https://user-images.githubusercontent.com/66855036/128082692-3f6f75da-9334-44c1-829e-1f3449cc9dbb.png)

Above screenshot shows example logic simulating a stop light sequence

# How to install
* Requires Node-RED
* Configure the following in settings.js of your node-red installation
```
    httpRoot: '/',
    httpStatic: '/home/pi/.node-red/public/',
    // change above to your node-red directory, name of subdir is arbitrary.
```
* If you are using a different httpRoot, this can be updated in public/rete/rete-script.js
```
    const nodered_url_prefix = "/";
```
* Place the http files located in public/rete such that the "rete" folder is a child of the "httpStatic" folder
* ---- When node-red is running, the http files should be accessible at http://127.0.0.1:1880/rete/index.html (ip and port can be anything)
* Import the ReteLogic.json file into node-red
* Deploy the flow and navigate to /rete/index.html

![image](https://user-images.githubusercontent.com/66855036/128082735-d1e9d46b-94e8-4978-bbaf-3331135377e2.png)

# How it works

The front end uses the [rete.js](http://rete.js.org) library, but does not use it to perform any calculation or actual logic. Rete is not meant for procedural programming, for example if you look at the example on their site and loop two AND blocks into eachother the calculation halts and the console logs the message "Recursion detected". When programming a PLC with function blocks, a recursive design like this is sometimes intended. The difference is that Rete is trying to **solve** the logic, whereas here we only care about **iterating** the logic.

So, this is why we use the "toJSON" function to download the logic (or manifest) to the backend server (node-red) where it is put into order by "Scan ID" and then each block is calculated in phase. Node-RED is maintaining a scan-rate (set to 1s by the inject node) and each time it executes it pushes the live data to a websocket where the front-end then updates it to the blocks. The INPUT and OUTPUT blocks are special in that they always scan first for inputs or last for outputs.

# Notes / Remarks

Big picture, this is intended to bring PLC style "FBD" programming to microdevices like the Pi and BBB. Currently, the core logic is running in a Node-RED flow, next steps will to be to aggregate everything into a single custom node. Then in the future maybe I will make this into a stand-alone node application, but for now the plan is to piggyback off of that ecosystem.


