/* Web Utility Toolkit */
if (typeof WUT === 'undefined' || !WUT) {
  WUT = function(libs) { // Power constructor pattern
    var W = this;
    if(!(this instanceof WUT)) { // If WUT was called without new
      return new WUT(libs);
    }

    /* WUT Utilities */
    (function() {
      var Utils = {};
      Utils.create = function(o) {
        function F() {}
        F.prototype = o;
        return new F();
      };
      /* Load capabilities from external libraries */
      if(libs && libs.YUI) {
        if(libs.YUI.one) {
          Utils.one = function(selector) {
            return Y.one(selector);
          };
        }
        if(libs.YUI.JSON && libs.YUI.JSON.stringify) {
          Utils.jsonStringify = function(obj) {
            return Y.JSON.stringify(obj);
          };
        }
        if(libs.YUI.Cookie) {
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
        if(libs.YUI.Event) {
          Utils.purgeElement = function(selector) {
            return Y.Event.purgeElement(selector);
          };
        }
        if(libs.YUI.on) {
          Utils.on = function(event, fn, selector, scope) {
            return Y.on(event, fn, selector, scope);
          };
        }
        if(libs.YUI.io && libs.YUI.io.queue) {
          Utils.io = function(endpoint, config) {
            return Y.io.queue(endpoint, config);
          };
          Utils.stop = function() {
            return Y.io.queue.stop();
          };
          Utils.start = function() {
            return Y.io.queue.start();
          };
        }
        if(libs.YUI.DataType) {
          Utils.dateFormat = function(date, formatObj) {
            return Y.DataType.Date.format(date, formatObj);
          };
        }
      }
      // Simple JavaScript Templating
      // John Resig - http://ejohn.org/ - MIT Licensed
      (function(){
        var cache = {};

        Utils.tmpl = function tmpl(str, data){
          var fn;

          // Figure out if we're getting a template, or if we need to
          // load the template - and be sure to cache the result.
          if(!/\W/.test(str)) {
            cache[str] = cache[str] || Utils.tmpl(document.getElementById(str).innerHTML);
            fn = cache[str]; 
          } else {
            // Generate a reusable function that will serve as a template
            // generator (and which will be cached).
            var fn = new Function("obj",
                "var p=[],print=function(){p.push.apply(p,arguments);};" +

                // Introduce the data as local variables using with(){}
                "with(obj){p.push('" +
         
                // Convert the template into pure JavaScript
                str.replace(/[\r\t\n]/g, " ")
                   .replace(/'(?=[^%]*%>)/g,"\t")
                   .split("'").join("\\'")
                   .split("\t").join("'")
                   .replace(/<%=(.+?)%>/g, "',$1,'")
                   .split("<%").join("');")
                   .split("%>").join("p.push('")
                + "');}return p.join('');");
          }

          // Provide some basic currying to the user
          return data ? fn( data ) : fn;
        };
      })();
      W.Utils = Utils;
    })();

    /* AJAX API */
    (function() {
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
              value = W.Utils.jsonStringify(params[key]); 
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
        token = W.Utils.Cookie.get("token", {raw: true});
        if(token) {
          options.headers["AUTHENTICATION-TOKEN"] = token;
        }

        returnArgs = {Y:libs.Y, WUT:W, resource: options.resource, table: params.table, method: options.method};
        returnArgs.args = args;

        W.Utils.io(endpoint, {
          method: options.method,
          data: data,
          headers: options.headers,
          on: {
            success: function(id, o, a) {
              if(callback) {
                callback(id, 
                  eval("(" + o.responseText + ")"), 
                  returnArgs
                ); 
              }
            }
          },
          context: this,
          arguments: args
        });
      };
      // parseUri 1.2.2 - Breaks a URI into pieces
      // (c) Steven Levithan <http://blog.stevenlevithan.com/archives/parseuri> - MIT License
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
      W.URL = function(parts) {
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
      W.get = function(options, params, callback, args) {
        options.method = "GET";
        request(options, params, callback, args);
        return this;
      };
      W.post = function(options, params, callback, args) {
        options.method = "POST";
        request(options, params, callback, args);
        return this;
      };
      W.put = function(options, params, callback, args) {
        options.method = "PUT";
        request(options, params, callback, args);
        return this;
      };
      W.del = function(options, params, callback, args) {
        options.method = "DELETE";
        request(options, params, callback, args);
        return this;
      };
      W.multiRequest = function(finalCallback, args) {
        var requests = [];
        return {
          get: function(options, params, callback, args) {
            requests.push({method:W.get, options:options, params:params, callback:callback, args:args});
          },
          post: function(options, params, callback, args) {
            requests.push({method:W.post, options:options, params:params, callback:callback, args:args});
          },
          put: function(options, params, callback, args) {
            requests.push({method:W.put, options:options, params:params, callback:callback, args:args});
          },
          del: function(options, params, callback, args) {
            requests.push({method:W.del, options:options, params:params, callback:callback, args:args});
          },
          start: function() {
            var req, responses = [];
            if(requests && requests.length > 0) {
              W.Utils.stop(); // Allow queuing
              for(req in requests) { if(requests.hasOwnProperty(req)) {
                (function() {
                  var get = requests[req], 
                      callback = get.callback;
                  if(parseInt(req, 10) === requests.length - 1) {
                    get.callback = function(id, o, a) {
                      responses.push(o); // visibility?
                      if(callback) {
                        callback(id, o, a);
                      }
                      if(typeof(finalCallback) === 'function') {
                        finalCallback(responses, args);
                      }
                    };
                  } else {
                    get.callback = function(id, o, a) {
                      responses.push(o);
                      if(callback) {
                        callback(id, o, a);
                      }
                    };
                  }
                  get.method(get.options, get.params, get.callback, get.args);
                })();
              }}
              W.Utils.start(); // Re-start the queue
            } else {
              if(typeof(finalCallback) === 'function') {
                finalCallback([], args);
              }
            }
          }
        };
      };
      W.currentUser = function() {
        var username = W.Utils.Cookie.get("username", {raw: true});
        var token = W.Utils.Cookie.get("token", {raw: true});
        if(token) {
          return {username: username, token: token};
        } else {
          return {};
        }
      };
      W.login = function(username, password, success) {
        var loginCallback = function(id, o, a) {
          var today = new Date(),
              tomorrow = new Date();
          if(o.result.indexOf("message") !== 0) { // Response doesn't start with an error message
            tomorrow.setDate(today.getDate() + 1);
            W.Utils.Cookie.set("username", a.args.username, {expires: tomorrow, raw: true});
            W.Utils.Cookie.set("token", o.result, {expires: tomorrow, raw: true});
            if(success) success(id, o, a);
          } else {
            if(success) success(id, o, a); // Todo: failure callback
          }
        };
        this.post({resource: "authentication"}, {username: username, password: password}, loginCallback, {username:username});
      };
      W.logout = function(success) {
        console.log("logout");
        var token,
            logoutCallback;
        logoutCallback = function(id, o, a) {
          console.log("logout callback");
          if(o.result === "success") {
            if(success) success(id, o, a);
          } else {
            if(success) success(id, o, a); // Todo: failure callback
          }
        };
        token = W.Utils.Cookie.get("token", {raw: true});
        W.Utils.Cookie.remove("username");
        W.Utils.Cookie.remove("token");
        W.del({resource: "authentication"}, {token: token}, logoutCallback);
      };
    })();

    /* Component Utilities */
    (function() {
      W.Component = {};
      W.Component.getFormValues = function(cols) {
        var col, values = {}, foundNode;
        for(col in cols) { if(cols.hasOwnProperty(col)) {
          if(cols[col] && cols[col].type === "date") {
            values[col] = W.Utils.dateFormat(new Date(), {format:"%Y-%m-%d %T"});
          } else if(cols[col] && cols[col].type === "username") {
            values[col] = W.currentUser().username;
          } else if(cols[col] && cols[col].type === "select") {
            foundNode = W.Utils.one("#" + col);
            values[col] = foundNode.get("options").item(foundNode.get("selectedIndex")).get("value");
          } else { // Text and textarea
            foundNode = W.Utils.one("#" + col);
            if(foundNode) {
              values[col] = foundNode.get("value");
            }
          }
        }}
        return values;
      };
      W.Component.isLoggedIn = function() {
        var user = W.currentUser();
        return (user.username) ? true: false;
      };
      W.Component.changeViewState = function(viewStates, currentState, newState, config, args) {
        var request, preload, preloads = [];
        
        if(!W.Component.isLoggedIn()) {
          newState = viewStates.login;
        }
        
        if(currentState && currentState.onUnload) {
          currentState.onUnload();
        }
        currentState = newState;
        
        if(newState.onPreload) {
          preloads = newState.onPreload(args);
        }
        reqs = W.multiRequest(function(responses, newState) {
          /* Construct controller */
          c = newState.controller(responses, args);
          /* Create template */
          html = newState.template(c);
          /* Render template */
          W.Utils.one(config.target).setContent(html);
          /* Attach event handlers */
          if(c.onRender) {
            c.onRender();
          }
        }, newState);
        // Load the request queue
        for(preload in preloads) { if(preloads.hasOwnProperty(preload)) {
          (function() {
            request = preloads[preload];
            reqs.get(request.options, request.params, request.callback, request.args);
          })();
        }}
        reqs.start(); // Empty the requets queue
      };
    })();
    
    /* Execute Addons */
    (function() {
      var addon;
      for(addon in WUT.addons) { if (WUT.addons.hasOwnProperty(addon)) {
        WUT.addons[addon](W);// modules add themselves to the instance
      }}
    })();

    // implied "return this;" if constructed with new
  };
}

/* Global WUT properties and methods */
WUT.addons = {};
WUT.addsafes = {};
WUT.go = function(name, fn, safe) {
  var addonCollection = this.addons;
  if(safe) {
    addonCollection = this.addsafes;
  }
  if(!addonCollection[name]) {
    addonCollection[name] = fn;
  }
  return this; // chain support
};
WUT.lib = function(name, fn, safe) {};
WUT._intercept = function(fn) {};

// cleanup default 'constructor' property on prototype
WUT.prototype = {};