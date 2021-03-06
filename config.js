
var config = require('./config/default.json');
var async=require('async');
var argv = require('minimist')(process.argv.slice(2));
var version = require('./package.json').version;
var test = require('./test/testconfig');

console.dir(argv);

var conf;

switch (process.env['NODE_ENV']) {
  case 'dev':
    conf = config.dev;
    break;
  case 'test':
    conf = config.dev;
    test.customTestConfig(conf);
    break;
  default:
    conf = config.production;
    break;
}


async.eachOf(conf, function(param, index,callback) {

    // Perform operation on file here.
    console.log('Processing Key ' + index);
    if(argv[index])
        conf[index]=argv[index];
    callback();
});

 //p.version.split('.').shift();
  // module.exports.host= process.env.HOST || 'localhost';
  // module.exports.port= process.env.PORT || 3000;

module.exports.conf = conf;
module.exports.generalConf = config;
