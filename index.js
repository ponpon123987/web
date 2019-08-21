const express = require("express");
const bodyparser = require("body-parser")


app = express();
app.use(bodyparser.json())
app.use(express.static(__dirname + "/"));

app.get("/", (req, res) => {
  res.sendFile("index.html");
});



app.get("/check",(req,res)=>{
  res.sendFile("check.html",{root:__dirname})
});

app.post("/manifest",(req,res)=>{

    var example_manifest_code = `
---
applications:
- name: ${req.body.app_Name}
  memory: ${req.body.application_memory}M
  disk_quota: ${req.body.application_diskqouta}M
  buildpack: nodejs_buildpack
  command: node app.js
services:
- ${req.body.service_instance}`;
    
    res.send(example_manifest_code);
});

app.post("/deploy",(req,res)=>{

  var deploy_guide = `
  // Push your App to WISE-PaaS via Cloud Foundry

  cf push ${req.body.appName}`;
  
  res.send(deploy_guide);
});

app.post("/indexFile", (req, res) => {
  console.log(req.body)
  if (req.body.type === "rabbitmq") {
    
  var example_node_code = `
    // This is a JavaScript source code, save as 'app.js'
    // To test locally, remember to install the node packages.
    // Run 'npm init', to initailize a 'package.json' file
    // Run 'npm install {node_package} --save' to install packages
    // Run 'node app.js' to start this server

    //Source code starts here//
    const express = require('express');
    const mqtt = require('mqtt');

    app = express()

    app.use('/',(req,res)=>{
        res.send('hello world')
    })

    //get the WISE-PaaS environment vcap_services config 
    let vcap_services = JSON.parse(process.env.VCAP_SERVICES);

    mqtt_servicename="${req.body.serviceName}"
    mqtt_broker = "mqtt://"+ vcap_services[mqtt_servicename][0].credentials.protocols.mqtt.host;
    mqtt_username = vcap_services[mqtt_servicename][0].credentials.protocols.mqtt.username.trim();
    mqtt_password = vcap_services[mqtt_servicename][0].credentials.protocols.mqtt.password.trim();
    mqtt_port =vcap_services[mqtt_servicename][0].credentials.protocols.mqtt.port;
    
    mqtt_options=
    {
        broker:mqtt_broker,
        reconnectPeriod: 1000,
        port: mqtt_port,
        username: mqtt_username,
        password: mqtt_password
    };

    mqtt_topic = "/${req.body.topic}/#";
    mqtt_retain = true;

    var client = mqtt.connect(mqtt_broker,mqtt_options);

    
    client.on("connect", function() {
      client.subscribe(mqtt_topic);
      console.log("[MQTT]:", "Connected.");
    });
    
    client.on("message", function(topic, message) {
      console.log("[" + topic + "]:" + message.toString());
    });
    
    client.on("error", function(err) {
      console.log(err);
    });
    
    client.on("close", function() {
      console.log("[MQTT]: close");
    });
    
    client.on("offline", function() {
      console.log("[MQTT]: offline");
    });


    const port = process.env.PORT || 3000
    app.listen(port,()=>{
        console.log(\`listen port on process \${port} \`);
    })`;
    res.send(example_node_code);
  } else {
    res.send("no type");
  }

  
});

app.listen(process.env.PORT || 3030, () => {
  console.log("Listen on port 3030");
});


