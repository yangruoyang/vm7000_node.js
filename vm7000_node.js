/*
var http = require('http');
var server = http.createServer();
var value;
server.on('request',function(req,res){
	res.writeHead(200,{'content-Type':'text/html','Access-Control-Allow-Origin':'*'});
	res.write(value);
	res.end();
});
server.listen(8080,'0.0.0.0');
*/

var value;
var net = require('net');
var host = '192.168.0.199';
var port = 502;
var mongoose = require("mongoose");
mongoose.Promise = require('bluebird');
var db = mongoose.createConnection('localhost','VM7000');

var vmschema = new mongoose.Schema({
  Rdate:{type:Date,default:Date.now},
  Model_No:String,
  pv:[]
});

var vms = db.model('vms',vmschema);


var mbs = new Buffer([0x00,0x01,0x00,0x00,0x00,0x06,0x01,0x04,0x00,0x64,0x00,0x06]);

var client = new net.Socket();
var getvalue = function() {client.write(mbs);}

client.connect(port,host,function(){
//	console.log("connected to vm7000");
});

client.on('data',function(data){
	//console.log(data);
  var vm = new vms({Model_No:'VM1',pv:[]});
  var temp;
  for(var i=0;i<6;i++){
    temp = data.readUInt16BE(9+i*2);
    if(temp < 32767){
      vm.pv.push(temp/100);
    }else{
      vm.pv.push((temp-65536)/100);
    }
      //console.log(vm.pv);
  }
  vm.save();
	value = data;
  //vms.insert(vm);
 // console.log(vm);
});

setInterval(getvalue,1000);


/*
var mongodb = require('mongodb');
var server = new mongodb.Server('localhost',27017,{auto_reconnection:true});
var db = new mongodb.Db('VM7000',server,{safe:true});
var vms;
db.open(function(err,db){
db.collection('vms',{safe:true},function(err,collection){
  vms = collection;
  debugger;
 // collection.insert({'test':'test1'},{safe:true},function(err,result){
//  });
});});
*/
var express = require('express');
var app = express();

app.use(express.static(__dirname));

app.get('/',function(req,res){
  res.sendFile('/home/pi/vm7000_node.js/vm7000.htm');
}
);

app.get('/getvalue',function(req,res){
  //res.writeHead(200,{'content-Type':'text/html','Access-Control-Allow-Origin':'*'});
  res.send(value);
  res.end;
});


app.listen(8080);
