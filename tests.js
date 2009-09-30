<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd"> 
<html> 
<head> 
<meta http-equiv="content-type" content="text/html; charset=utf-8"> 
<title>Simple WUT Testing</title> 
<link type="text/css" rel="stylesheet" href="http://yui.yahooapis.com/3.0.0/build/cssfonts/fonts-min.css" /> 
<script type="text/javascript" src="http://yui.yahooapis.com/3.0.0/build/yui/yui-min.js"></script> 
<style type="text/css"> 
#testLogger {
    margin-bottom: 1em;
}
 
#testLogger .yui-console .yui-console-title {
    border: 0 none;
    color: #000;
    font-size: 13px;
    font-weight: bold;
    margin: 0;
    text-transform: none;
}
#testLogger .yui-console .yui-console-entry-meta {
    margin: 0;
}
 
.yui-skin-sam .yui-console-entry-pass .yui-console-entry-cat {
    background: #070;
    color: #fff;
}
</style> 
</head> 
 
<body class=" yui-skin-sam"> 
<h1>Simple Synchronous Resource Testing</h1> 
<div id="testLogger"></div> 
<script type="text/javascript"> 
YUI({combine: true, timeout: 10000}).use("node", "console", "test",function (Y) {
 
  Y.namespace("example.test");
    
  Y.example.test.DataTestCase = new Y.Test.Case({

    name: "Syncronous Resource Tests",
  
    testHash : function () {
      WUT.post({resource:"hash"}, {id:"5", value:"8"});
      WUT.get({resource:"hash"}, {id:"5"}, function(json) {
        Y.Assert.areEqual(json.value, "8");
      });
    },
  
    testFlat : function () {
      WUT.put({resource:"flat"}, {table:"color", data:[100, 0, 0]}); // red
      WUT.put({resource:"flat"}, {table:"color", data:[0, 0, 100]}); // blue 
      WUT.put({resource:"flat"}, {table:"color", data:[0, 100, 0]}); // gree 
      WUT.get({resource:"flat"}, {table:"color"}, function(json) {
        var resultSize = json.results.length;
        Y.Assert.areEqual(3, resultSize);
      }); 
    }
  });

  Y.example.test.ExampleSuite = new Y.Test.Suite("WUT Suite");
  Y.example.test.ExampleSuite.add(Y.example.test.DataTestCase);
   
  //create the console
  var r = new Y.Console({
    newestOnTop : false,
    style: 'block' // to anchor in the example content
  });
      
  r.render('#testLogger');
      
  Y.Test.Runner.add(Y.example.test.ExampleSuite);
   
  //run the tests
  Y.Test.Runner.run();
 
});
</script>
</body> 
</html> 


