var WUT = function(callback) {
  YUI({
    base:"../yui/build/",
    combine: true,
    timeout: 10000,
    filter: "DEBUG"
  }).use("io-queue", "io", "io-xdr", "json", function(Y) {
  
    var request = function(options, params, callback) {
      var endpoint = "http://api.webutilitykit.com:8000",
        path,
        amp = "",
        data = "",
        param;
      
      if(typeof options.resource !== 'undefined' && options.resource !== "") {
        path = "/resource/json/" + options.resource;

        for(var key in params) { if(params.hasOwnProperty(key)) {
          if(key && params[key]) {
            param = Y.JSON.stringify(params[key]); 
            data = data + amp + key + "=" + param;
            //data = data + amp + key + "=" + params[key];
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
          success: function(id, o, a) {
            callback(id, Y.JSON.parse(o.responseText), a);
          }
        }
      });
    };
  
    var WUT = {
      get: function(options, params, callback) {
        options.method = "GET";
        request(options, params, callback);
        return this;
      },
      post: function(options, params, callback) {
        options.method = "POST";
        request(options, params, callback);
        return this;
      },
      put: function(options, params, callback) {
        options.method = "PUT";
        request(options, params, callback);
        return this;
      },
      del: function(options, params, callback) {
        options.method = "DELETE";
        request(options, params, callback);
        return this;
      }
    };
    return callback(Y, WUT);
  });
};