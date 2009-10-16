var WUT = function(callback) {
  YUI({
    base:"../yui/build/",
    combine: true,
    timeout: 10000,
    filter: "DEBUG"
  }).use("io-queue", "io", "io-xdr", "json", "node", "event-custom", "datatype", function(Y) {

    var request = function(options, params, callback, args) {
      var endpoint = "http://api.webutilitykit.com:8000",
        path,
        amp = "",
        data = "",
        param;
      
      if(typeof options.resource !== 'undefined' && options.resource !== "") {
        path = "/resource/json/" + options.resource;

        for(var key in params) { if(params.hasOwnProperty(key)) {
          if(key && params[key]) {
            value = Y.JSON.stringify(params[key]); 
            data = data + amp + key + "=" + value;
            amp = "&";
          }
        }}
      }
      
      endpoint = endpoint + path + ((data)? "?" + data: ""); 

      Y.io.queue(endpoint, {
        method: options.method,
        data: data,
        headers: options.headers,
        on: {
          success: function (id, o, a) {
            callback(id, 
              eval("(" + o.responseText + ")"), 
              {Y:Y, WUT:WUT, resource: options.resource, table: params.table, method: options.method},
              a
            ); 
          }
        },
        context: this,
        arguments: args
      });
    };
  
    var WUT = {
      get: function(options, params, callback, args) {
        options.method = "GET";
        request(options, params, callback, args);
        return this;
      },
      post: function(options, params, callback, args) {
        options.method = "POST";
        request(options, params, callback, args);
        return this;
      },
      put: function(options, params, callback, args) {
        options.method = "PUT";
        request(options, params, callback, args);
        return this;
      },
      del: function(options, params, callback, args) {
        options.method = "DELETE";
        request(options, params, callback, args);
        return this;
      }
    };
    return callback(Y, WUT);
  });
};