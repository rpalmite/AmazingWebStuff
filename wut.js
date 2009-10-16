var WUT = function(callback) {
  YUI({
    base:"../yui/build/",
    combine: true,
    timeout: 10000,
    filter: "DEBUG"
  }).use("io-queue", "io", "io-xdr", "json", "node", "event-custom", "datatype", "cookie", function(Y) {

    var request = function(options, params, callback, args) {
      var endpoint = "http://api.webutilitykit.com:8000",
        path,
        amp = "",
        data = "",
        param,
        token,
        returnArgs;
      
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

      // Add authentication token to headers on every request (except login)
      if(!options.headers) {
        options.headers = {};
      }
      token = Y.Cookie.get("token", {raw: true});
      if(token) {
        options.headers["AUTHENTICATION-TOKEN"] = token;
      }
      
      returnArgs = {Y:Y, WUT:WUT, resource: options.resource, table: params.table, method: options.method};
      returnArgs.args = args;

      Y.io.queue(endpoint, {
        method: options.method,
        data: data,
        headers: options.headers,
        on: {
          success: function (id, o, a) {
            callback(id, 
              eval("(" + o.responseText + ")"), 
              returnArgs
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
      },
      currentUser: function() {
        var username = Y.Cookie.get("username", {raw: true});
        var token = Y.Cookie.get("token", {raw: true});
        if(token) {
          return {username: username, token: token};
        } else {
          return {};
        }
      },
      login: function(username, password, success) {
        var loginCallback = function(id, o, a) {
          var today = new Date(),
              tomorrow = new Date();
          if(o.result.indexOf("message") !== 0) { // Response doesn't start with an error message
            tomorrow.setDate(today.getDate() + 1);
            Y.Cookie.set("username", a.args.username, {expires: tomorrow, raw: true});
            Y.Cookie.set("token", o.result, {expires: tomorrow, raw: true});
            success(id, o, a);
          } else {
            success(id, o, a); // Todo: failure callback
          }
        };
        this.post({resource: "authentication"}, {username: username, password: password}, loginCallback, {username:username});
      },
      logout: function(success) {
        console.log("logout");
        var token,
            logoutCallback;
        logoutCallback = function(id, o, a) {
            console.log("logout callback");
          if(o.result === "success") {
            success(id, o, a);
          } else {
            success(id, o, a); // Todo: failure callback
          }
        };
        token = Y.Cookie.get("token", {raw: true});
        Y.Cookie.remove("username");
        Y.Cookie.remove("token");
        this.del({resource: "authentication"}, {token: token}, logoutCallback);
      }
    };
    return callback(Y, WUT);
  });
};