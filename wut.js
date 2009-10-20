var WUT = function(libs) {
  var Utils = {};
  if(libs) {
    if(libs.YUI && libs.YUI.JSON && libs.YUI.JSON.stringify) {
      Utils.jsonStringify = function(obj) {
        return Y.JSON.stringify(obj);
      };
    }
    if(libs.YUI && libs.YUI.Cookie) {
      Utils.Cookie = {
        get: function(key, params) {
          return Y.Cookie.get(key, params);
        },
        set: function(key, value, params) {
          return Y.Cookie.set(key, value, params);
        },
        remove: function(key) {
          return Y.Cookie.remove(key);
        }
      };
    }
    if(libs.YUI && libs.YUI.io && libs.YUI.io.queue) {
      Utils.io = function(endpoint, config) {
        Y.io.queue(endpoint, config);
      };
    }
  }

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
          value = Utils.jsonStringify(params[key]); 
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
    token = Utils.Cookie.get("token", {raw: true});
    if(token) {
      options.headers["AUTHENTICATION-TOKEN"] = token;
    }

    returnArgs = {Y:Y, WUT:WUT, resource: options.resource, table: params.table, method: options.method};
    returnArgs.args = args;

    Utils.io(endpoint, {
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
    
  // parseUri 1.2.2
  // (c) Steven Levithan <http://blog.stevenlevithan.com/archives/parseuri>
  // MIT License
  // Breaks a URI into pieces
  var parseUri = function(str, isStrict) {
    var o = {
      strictMode: ((isStrict === true)? true: false),
      key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
      q: {
        name: "queryKey",
        parser: /(?:^|&)([^&=]*)=?([^&]*)/g
      },
      parser: {
        strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
        loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
      }
    },
    m = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
    uri = {},
    i = 14;

    while (i--) uri[o.key[i]] = m[i] || "";

    uri[o.q.name] = {}
    uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
      if ($1) uri[o.q.name][$1] = $2;
    });

    return uri;
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
      var username = Utils.Cookie.get("username", {raw: true});
      var token = Utils.Cookie.get("token", {raw: true});
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
          Utils.Cookie.set("username", a.args.username, {expires: tomorrow, raw: true});
          Utils.Cookie.set("token", o.result, {expires: tomorrow, raw: true});
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
      token = Utils.Cookie.get("token", {raw: true});
      Utils.Cookie.remove("username");
      Utils.Cookie.remove("token");
      this.del({resource: "authentication"}, {token: token}, logoutCallback);
    },
    URL: function(parts) {
      return {
        // todo: http://benalman.com/projects/jquery-url-utils-plugin/
        isSameHost : function(url) {
          return this.parts().host === url.parts().host;
        },
        parts : function() { 
          if(parts.source) {
            return parseUri(parts.source);
          } else {
            return null;
          }
        },
        getQueryParams: function() {
          var keyValuePairs = this.parts()["query"].split(/[&?]/g),
              params = {},
              m,
              key,
              i
          for (i = 0, n = keyValuePairs.length; i < n; ++i) {
            m = keyValuePairs[i].match(/^([^=]+)(?:=([\s\S]*))?/);
            if (m) {
              key = decodeURIComponent(m[1]);
              params[key] = decodeURIComponent(m[2]);
            }
          }
          return params;
        },
        toString: function() {
          if(parts.source) {
            return parts.source + "";
          }
        }
      }
    }
  };
  return WUT;
};