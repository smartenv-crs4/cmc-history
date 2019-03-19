var query = ["one", "two"];
var plugins=[
    {
        "resource":"/resourceToExtend",
        "method":"GET",
        "mode":"override",
        "params":[query],
        "extender": function(req,content,cType,callback){
            callback(null, {first: "hello"});
        }
    },
    {
        "resource":"/OtherResourceToExtend",
        "method":"GET",
        "mode":"before",
        "params":[query],
        "extender": function(req,content,cType,callback){
            callback(null,"Content extension");
        }
    }
];

module.exports = plugins;
