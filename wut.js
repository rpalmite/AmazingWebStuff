/* Web Utility Toolkit */
var WUT = function(libs) { // Power constructor pattern
  var Utils = {},
      WUTObj = {},
      extend;
  
  /* WUT Utilities */
  isA = function(o) {
    function F() {}
    F.prototype = o;
    return new F();
  };
  (function() {
    /* Load capabilities from external libraries */
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
  
    WUTObj.URL = function(parts) {
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
    WUTObj.get = function(options, params, callback, args) {
      options.method = "GET";
      request(options, params, callback, args);
      return this;
    };
    WUTObj.post = function(options, params, callback, args) {
      options.method = "POST";
      request(options, params, callback, args);
      return this;
    };
    WUTObj.put = function(options, params, callback, args) {
      options.method = "PUT";
      request(options, params, callback, args);
      return this;
    };
    WUTObj.del = function(options, params, callback, args) {
      options.method = "DELETE";
      request(options, params, callback, args);
      return this;
    };
    WUTObj.currentUser = function() {
      var username = Utils.Cookie.get("username", {raw: true});
      var token = Utils.Cookie.get("token", {raw: true});
      if(token) {
        return {username: username, token: token};
      } else {
        return {};
      }
    };
    WUTObj.login = function(username, password, success) {
      var loginCallback = function(id, o, a) {
        var today = new Date(),
            tomorrow = new Date();
        if(o.result.indexOf("message") !== 0) { // Response doesn't start with an error message
          tomorrow.setDate(today.getDate() + 1);
          Utils.Cookie.set("username", a.args.username, {expires: tomorrow, raw: true});
          Utils.Cookie.set("token", o.result, {expires: tomorrow, raw: true});
          if(success) success(id, o, a);
        } else {
          if(success) success(id, o, a); // Todo: failure callback
        }
      };
      this.post({resource: "authentication"}, {username: username, password: password}, loginCallback, {username:username});
    };
    WUTObj.logout = function(success) {
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
      token = Utils.Cookie.get("token", {raw: true});
      Utils.Cookie.remove("username");
      Utils.Cookie.remove("token");
      this.del({resource: "authentication"}, {token: token}, logoutCallback);
    };
  })();

  /* List-Detail UI Component */
  (function() {
    WUTObj.listDetail = function(config) {
      var currentState;
    
      var getFormValues = function(cols) {
        var col, values = {}, foundNode;
        for(col in cols) { if(cols.hasOwnProperty(col)) {
          if(cols[col] && cols[col].type === "date") {
            values[col] = Y.DataType.Date.format(new Date(), {format:"%Y-%m-%d %T"});
          } else if(cols[col] && cols[col].type === "username") {
            values[col] = WUT.currentUser().username
          } else {
            foundNode = Y.one("#" + col);
            if(foundNode) {
              values[col] = foundNode.get("value");
            }
          }
        }}
        return values;
      };
    
      var multiRequest = function(requests, success, newState) {
        var req, get, responses = [], callback;
        if(requests && requests.length > 0) {
          for(req in requests) { if(requests.hasOwnProperty(req)) {
            get = requests[req];
            callback = get.callback;
            if(parseInt(req, 10) === requests.length - 1) {
              get.callback = function(id, o, a) {
                responses.push(o); // visibility?
                if(callback) {
                  callback(id, o, a);
                }
                if(typeof(success) === 'function') {
                  success(responses, newState);
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
            WUT.get(get.options, get.params, get.callback, get.args);
          }}
        } else {
          if(typeof(success) === 'function') {
            success([], newState);
          }
        }
      };
  
      var isLoggedIn = function() {
        var user = WUT.currentUser();
        return (user.username) ? true: false;
      };
  
      var changeViewState = function(newState, args) {
        var resource, request, requests = [], preloads = [];
        
        if(!isLoggedIn()) {
          newState = viewStates.login;
        }
        
        if(currentState && currentState.onUnload) {
          currentState.onUnload();
        }
        currentState = newState;
        
        if(newState.onPreload) {
          preloads = newState.onPreload(args);
        }
        
        multiRequest(preloads, function(responses, newState) {
          /* Construct controller */
          c = newState.controller(responses, args);
          /* Create template */
          html = newState.template(c);
          /* Render template */
          Y.one(config.target).setContent(html);
          /* Attach event handlers */
          if(c.onRender) {
            c.onRender();
          }
        }, newState);
      };
  
      var viewStates = {
        login: {
          template: Utils.tmpl("login"),
          controller: function() {
            return {}; // No controller needed
          }
        },
        newSingle: {
          onUnload: function() {
            Y.Event.purgeElement("#submit-ticket");
            Y.Event.purgeElement("#all-records");
          },
          template: Utils.tmpl("newticket"),
          controller: function(responses) {
      
            var saveSuccess = function(id, o, a) {
              var child, parentId = o.result;
              for(child in config.children) { if(config.children.hasOwnProperty(child)) {
                var childForm = getFormValues(config.children[child].cols);
                childForm.ticketId = parentId;
                WUT.put({resource: config.children[child].resource}, {table:config.children[child].name, data:childForm}, function(id, o, a) {
                  changeViewState(viewStates.editSingle, {id: parentId});
                });
              }}
              changeViewState(viewStates.editSingle, {id: ticketId});
            };
        
            return {
              save: function() {
                var form = getFormValues(config.model.cols);
                WUT.put({resource: config.model.resource}, {table:config.model.name, data:form}, saveSuccess);
              },
              loadAll: function() {
                changeViewState(viewStates.listAll);
              },
              onRender: function() {
                Y.on("click", this.save, "#submit-ticket", this);
                Y.on("click", this.loadAll, "#all-records", this);
              }
            };
          }
        },
        editSingle: {
          onPreload: function(args) {
            return [
              {options: {resource: config.model.resource}, params: {table:config.model.name, id:args.id}},
              {options: {resource: config.children[0].resource}, params: {table:config.children[0].name, filter:{"ticketId": args.id}}}
            ];
          },
          onUnload: function() {
            Y.Event.purgeElement("#all-records");
            Y.Event.purgeElement("#new-ticket");
          },
          template: Utils.tmpl("postticket"),
          controller: function(responses) {
        
            var saveSuccess = function(id, o, a) {
              var child;
              if(config.children) {
                for(child in config.children) { if(config.children.hasOwnProperty(child)) {
                  var childForm = getFormValues(config.children[child].cols);
                  WUT.put({resource: config.children[child].resource}, {table:config.children[child].name, data:childForm}, function(id, o, a) {
                    changeViewState(viewStates.editSingle);
                  }).exec();
                }}
              }
            };
        
            var deleteSuccess = function(id, o, a) {
        
            };
        
            return {
              record: function() {
                return responses[0].result[0];
              },
              children: function() {
                return responses[1].result;
              },
              save: function() {
                var form = getFormValues(config.model.cols);
                WUT.post({resource: config.model.resource}, {table:config.model.name, id:singleId, data:form}, saveSuccess);
                changeViewState(viewStates.editSingle);
              },
              newSingle: function() {
                changeViewState(viewStates.newSingle);
              },
              deleteSingle: function() {
                changeViewState(viewStates.listAll);
              },
              loadAll: function() {
                changeViewState(viewStates.listAll);
              },
              onRender: function() {
                Y.on("click", this.loadAll, "#all-records", this);
                Y.on("click", this.newSingle, "#new-ticket", this);
              }
            };
          }
        },
        listAll: {
          onPreload: function(args) {
            return [
              {options: {resource: config.model.resource}, params: {table:config.model.name}}
            ];
          },
          onUnload: function() {
            Y.Event.purgeElement(".new-record");
          },
          template: Utils.tmpl("listticket"),
          controller: function(responses) {
      
            var deleteSuccess = function(id, o, a) {
        
            };
        
            return {
              records: function() {
                return responses[0].result;
              },
              newSingle: function() {
                changeViewState(viewStates.newSingle);
              },
              loadSingle: function(e) {
                var recordRDFa = e.target.getAttribute("about");
                changeViewState(viewStates.editSingle, {id: recordRDFa.substring(10, recordRDFa.length - 1)});
              },
              deleteSingle: function(id) {
                changeViewState(viewStates.listAll);
              },
              onRender: function() {
                Y.on("click", this.loadSingle, ".new-record", this);
              }
            };
          }
        }
      };
  
      return {
        render: function() {
          changeViewState(viewStates.listAll);
        }
      };
    };
  })();
  
  return WUTObj;
};