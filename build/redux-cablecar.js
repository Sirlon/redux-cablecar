module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _middleware = __webpack_require__(1);

	var _middleware2 = _interopRequireDefault(_middleware);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = _middleware2.default;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _cableCar = __webpack_require__(2);

	var _cableCar2 = _interopRequireDefault(_cableCar);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	//import CableCarDispatcher from './cableCarDispatcher';

	var cableProvider = void 0;

	var car = void 0;

	//const dispatcher = new CableCarDispatcher();

	var middleware = function middleware(store) {
	  return function (next) {
	    return function (incomingAction) {
	      var action = incomingAction;

	      switch (action.type) {

	        case 'CABLECAR_INITIALIZED':
	        case 'CABLECAR_CONNECTED':
	        case 'CABLECAR_DISCONNECTED':
	          return next(action);

	        case 'CABLECAR_DESTROY':
	          if (car) {
	            car.unsubscribe(action.CableCarChannel);
	          }

	          return store.getState();

	        case 'CABLECAR_DESTROY_ALL':
	          if (car) {
	            car.unsubscribeAll();
	          }

	          return store.getState();

	        case 'CABLECAR_CHANGE_CHANNEL':
	          if (car) {
	            car.changeChannel(action.newChannel, action.params);
	          }

	          return store.getState();

	        default:
	          if (car && car.allows(action) && !action.CableCar__Action) {
	            if (car.running) {
	              car.send(action.channel, action);
	            } else {
	              console.error('CableCar: Dropped action!', 'Attempting to dispatch an action but cable car is not running.', action, 'optimisticOnFail: ' + car.options.optimisticOnFail);
	              return car.options.optimisticOnFail ? next(action) : store.getState();
	            }
	            return action.optimistic ? next(action) : store.getState();
	          } else {
	            return next(action);
	          }
	      }
	    };
	  };
	};

	middleware.connect = function (store, options) {
	  if (!cableProvider) {
	    try {
	      cableProvider = __webpack_require__(3);
	    } catch (e) {
	      throw new Error('CableCar: No actionCableProvider set and \'actioncable\' Node package failed to load: ' + e);
	    }
	  }

	  car = new _cableCar2.default(cableProvider, store, options);

	  // public car object returned
	  return {
	    changeChannel: car.changeChannel.bind(car),
	    getChannels: car.getChannels.bind(car),
	    perform: car.perform.bind(car),
	    send: car.send.bind(car),
	    unsubscribe: car.unsubscribe.bind(car),
	    subscribe: car.subscribe.bind(car)
	  };
	};

	middleware.setProvider = function (newProvider) {
	  cableProvider = newProvider;
	};

	exports.default = middleware;

/***/ }),
/* 2 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var CableCar = function () {
	  function CableCar(cableProvider, store) {
	    var _this = this;

	    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

	    _classCallCheck(this, CableCar);

	    this.initialized = function (channel) {
	      return _this.dispatch({ type: 'CABLECAR_INITIALIZED', channel: channel });
	    };

	    this.connected = function (channel) {
	      _this.dispatch({ type: 'CABLECAR_CONNECTED', channel: channel });
	      _this.running = true;
	      if (_this.options.connected) {
	        _this.options.connected.call(channel);
	      }
	    };

	    this.disconnected = function (channel) {
	      _this.dispatch({ type: 'CABLECAR_DISCONNECTED', channel: channel });
	      _this.running = false;
	      if (_this.options.disconnected) {
	        _this.options.disconnected.call(channel);
	      }
	    };

	    this.received = function (msg, channel) {
	      _this.dispatch(_extends({}, msg, { channel: channel }));
	    };

	    this.rejected = function (channel) {
	      throw new Error('CableCar: Attempt to connect was rejected.\n      (Channel: ' + channel + ')');
	    };

	    if (typeof cableProvider === 'undefined') {
	      throw new Error('CableCar: unknown ActionCable provider: ' + cableProvider);
	    }

	    if (typeof store === 'undefined' || typeof store.dispatch === 'undefined') {
	      throw new Error('CableCar: unknown store: ' + store);
	    }

	    this.actionCableProvider = cableProvider;
	    this.store = store;

	    var defaultOptions = { prefix: 'RAILS', optimisticOnFail: false };
	    this.initialize(Object.assign(defaultOptions, options));
	  }

	  _createClass(CableCar, [{
	    key: 'initialize',
	    value: function initialize(options) {

	      this.options = options;
	      this.running = false;
	      this.subscriptions = {};

	      this.consumer = this.actionCableProvider.createConsumer(options.wsURL);
	    }

	    // ActionCable callback functions

	  }, {
	    key: 'subscribe',
	    value: function subscribe(channel) {
	      var _this2 = this;

	      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	      this.subscriptions[channel] = this.consumer.subscriptions.create(Object.assign({ channel: channel }, params), {
	        initialized: function initialized() {
	          return _this2.initialized(channel);
	        },
	        connected: function connected() {
	          return _this2.connected(channel);
	        },
	        disconnected: function disconnected() {
	          return _this2.disconnected(channel);
	        },
	        received: function received(msg) {
	          return _this2.received(msg, channel);
	        },
	        rejected: function rejected() {
	          return _this2.rejected(channel);
	        }
	      });
	    }

	    // Redux dispatch function

	  }, {
	    key: 'dispatch',
	    value: function dispatch(action) {
	      var newAction = Object.assign(action, {
	        CableCar__Action: true
	      });
	      this.store.dispatch(newAction);
	    }
	  }, {
	    key: 'allows',
	    value: function allows(action) {
	      if ((typeof action === 'undefined' ? 'undefined' : _typeof(action)) !== 'object' || typeof action.type !== 'string') {
	        throw new Error('CableCar: ' + action + ' is not a valid redux action ({ type: ... })');
	      }

	      return this.matchPrefix(action.type);
	    }
	  }, {
	    key: 'matchPrefix',
	    value: function matchPrefix(type) {
	      var prefix = type.slice(0, this.options.prefix.length);
	      return prefix === this.options.prefix;
	    }

	    // ActionCable subscription functions (exposed globally)

	  }, {
	    key: 'changeChannel',
	    value: function changeChannel(channel) {
	      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	      if (this.subscriptions[channel]) {
	        this.unsubscribe(channel);
	        this.subscribe(channel, params);
	      } else {
	        throw new Error('CableCar: Unknown Channel ' + channel + ' to change Channel');
	      }
	    }
	  }, {
	    key: 'getChannels',
	    value: function getChannels() {
	      return Object.keys(this.subscriptions);
	    }
	  }, {
	    key: 'perform',
	    value: function perform(channel, method, payload) {
	      if (this.subscriptions[channel]) {
	        this.subscriptions[channel].perform(method, payload);
	      } else {
	        throw new Error('CableCar: Unknown Channel ' + channel + ' to call perform ' + method);
	      }
	    }
	  }, {
	    key: 'send',
	    value: function send(channel, action) {
	      if (this.subscriptions[channel]) {
	        this.subscriptions[channel].send(action);
	      } else {
	        throw new Error('CableCar: Unknown Channel ' + channel + ' to send ' + action.type);
	      }
	    }
	  }, {
	    key: 'unsubscribe',
	    value: function unsubscribe(channel) {
	      if (this.subscriptions[channel]) {
	        this.subscriptions[channel].unsubscribe();
	        this.disconnected(channel);
	      }
	    }
	  }, {
	    key: 'unsubscribeAll',
	    value: function unsubscribeAll() {
	      var _this3 = this;

	      Object.keys(this.subscriptions).forEach(function (channel) {
	        _this3.unsubscribe(channel);
	      });
	    }
	  }]);

	  return CableCar;
	}();

	exports.default = CableCar;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;(function() {
	  var context = this;

	  (function() {
	    (function() {
	      var slice = [].slice;

	      this.ActionCable = {
	        INTERNAL: {
	          "message_types": {
	            "welcome": "welcome",
	            "ping": "ping",
	            "confirmation": "confirm_subscription",
	            "rejection": "reject_subscription"
	          },
	          "default_mount_path": "/cable",
	          "protocols": ["actioncable-v1-json", "actioncable-unsupported"]
	        },
	        WebSocket: window.WebSocket,
	        logger: window.console,
	        createConsumer: function(url) {
	          var ref;
	          if (url == null) {
	            url = (ref = this.getConfig("url")) != null ? ref : this.INTERNAL.default_mount_path;
	          }
	          return new ActionCable.Consumer(this.createWebSocketURL(url));
	        },
	        getConfig: function(name) {
	          var element;
	          element = document.head.querySelector("meta[name='action-cable-" + name + "']");
	          return element != null ? element.getAttribute("content") : void 0;
	        },
	        createWebSocketURL: function(url) {
	          var a;
	          if (url && !/^wss?:/i.test(url)) {
	            a = document.createElement("a");
	            a.href = url;
	            a.href = a.href;
	            a.protocol = a.protocol.replace("http", "ws");
	            return a.href;
	          } else {
	            return url;
	          }
	        },
	        startDebugging: function() {
	          return this.debugging = true;
	        },
	        stopDebugging: function() {
	          return this.debugging = null;
	        },
	        log: function() {
	          var messages, ref;
	          messages = 1 <= arguments.length ? slice.call(arguments, 0) : [];
	          if (this.debugging) {
	            messages.push(Date.now());
	            return (ref = this.logger).log.apply(ref, ["[ActionCable]"].concat(slice.call(messages)));
	          }
	        }
	      };

	    }).call(this);
	  }).call(context);

	  var ActionCable = context.ActionCable;

	  (function() {
	    (function() {
	      var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

	      ActionCable.ConnectionMonitor = (function() {
	        var clamp, now, secondsSince;

	        ConnectionMonitor.pollInterval = {
	          min: 3,
	          max: 30
	        };

	        ConnectionMonitor.staleThreshold = 6;

	        function ConnectionMonitor(connection) {
	          this.connection = connection;
	          this.visibilityDidChange = bind(this.visibilityDidChange, this);
	          this.reconnectAttempts = 0;
	        }

	        ConnectionMonitor.prototype.start = function() {
	          if (!this.isRunning()) {
	            this.startedAt = now();
	            delete this.stoppedAt;
	            this.startPolling();
	            document.addEventListener("visibilitychange", this.visibilityDidChange);
	            return ActionCable.log("ConnectionMonitor started. pollInterval = " + (this.getPollInterval()) + " ms");
	          }
	        };

	        ConnectionMonitor.prototype.stop = function() {
	          if (this.isRunning()) {
	            this.stoppedAt = now();
	            this.stopPolling();
	            document.removeEventListener("visibilitychange", this.visibilityDidChange);
	            return ActionCable.log("ConnectionMonitor stopped");
	          }
	        };

	        ConnectionMonitor.prototype.isRunning = function() {
	          return (this.startedAt != null) && (this.stoppedAt == null);
	        };

	        ConnectionMonitor.prototype.recordPing = function() {
	          return this.pingedAt = now();
	        };

	        ConnectionMonitor.prototype.recordConnect = function() {
	          this.reconnectAttempts = 0;
	          this.recordPing();
	          delete this.disconnectedAt;
	          return ActionCable.log("ConnectionMonitor recorded connect");
	        };

	        ConnectionMonitor.prototype.recordDisconnect = function() {
	          this.disconnectedAt = now();
	          return ActionCable.log("ConnectionMonitor recorded disconnect");
	        };

	        ConnectionMonitor.prototype.startPolling = function() {
	          this.stopPolling();
	          return this.poll();
	        };

	        ConnectionMonitor.prototype.stopPolling = function() {
	          return clearTimeout(this.pollTimeout);
	        };

	        ConnectionMonitor.prototype.poll = function() {
	          return this.pollTimeout = setTimeout((function(_this) {
	            return function() {
	              _this.reconnectIfStale();
	              return _this.poll();
	            };
	          })(this), this.getPollInterval());
	        };

	        ConnectionMonitor.prototype.getPollInterval = function() {
	          var interval, max, min, ref;
	          ref = this.constructor.pollInterval, min = ref.min, max = ref.max;
	          interval = 5 * Math.log(this.reconnectAttempts + 1);
	          return Math.round(clamp(interval, min, max) * 1000);
	        };

	        ConnectionMonitor.prototype.reconnectIfStale = function() {
	          if (this.connectionIsStale()) {
	            ActionCable.log("ConnectionMonitor detected stale connection. reconnectAttempts = " + this.reconnectAttempts + ", pollInterval = " + (this.getPollInterval()) + " ms, time disconnected = " + (secondsSince(this.disconnectedAt)) + " s, stale threshold = " + this.constructor.staleThreshold + " s");
	            this.reconnectAttempts++;
	            if (this.disconnectedRecently()) {
	              return ActionCable.log("ConnectionMonitor skipping reopening recent disconnect");
	            } else {
	              ActionCable.log("ConnectionMonitor reopening");
	              return this.connection.reopen();
	            }
	          }
	        };

	        ConnectionMonitor.prototype.connectionIsStale = function() {
	          var ref;
	          return secondsSince((ref = this.pingedAt) != null ? ref : this.startedAt) > this.constructor.staleThreshold;
	        };

	        ConnectionMonitor.prototype.disconnectedRecently = function() {
	          return this.disconnectedAt && secondsSince(this.disconnectedAt) < this.constructor.staleThreshold;
	        };

	        ConnectionMonitor.prototype.visibilityDidChange = function() {
	          if (document.visibilityState === "visible") {
	            return setTimeout((function(_this) {
	              return function() {
	                if (_this.connectionIsStale() || !_this.connection.isOpen()) {
	                  ActionCable.log("ConnectionMonitor reopening stale connection on visibilitychange. visbilityState = " + document.visibilityState);
	                  return _this.connection.reopen();
	                }
	              };
	            })(this), 200);
	          }
	        };

	        now = function() {
	          return new Date().getTime();
	        };

	        secondsSince = function(time) {
	          return (now() - time) / 1000;
	        };

	        clamp = function(number, min, max) {
	          return Math.max(min, Math.min(max, number));
	        };

	        return ConnectionMonitor;

	      })();

	    }).call(this);
	    (function() {
	      var i, message_types, protocols, ref, supportedProtocols, unsupportedProtocol,
	        slice = [].slice,
	        bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
	        indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

	      ref = ActionCable.INTERNAL, message_types = ref.message_types, protocols = ref.protocols;

	      supportedProtocols = 2 <= protocols.length ? slice.call(protocols, 0, i = protocols.length - 1) : (i = 0, []), unsupportedProtocol = protocols[i++];

	      ActionCable.Connection = (function() {
	        Connection.reopenDelay = 500;

	        function Connection(consumer) {
	          this.consumer = consumer;
	          this.open = bind(this.open, this);
	          this.subscriptions = this.consumer.subscriptions;
	          this.monitor = new ActionCable.ConnectionMonitor(this);
	          this.disconnected = true;
	        }

	        Connection.prototype.send = function(data) {
	          if (this.isOpen()) {
	            this.webSocket.send(JSON.stringify(data));
	            return true;
	          } else {
	            return false;
	          }
	        };

	        Connection.prototype.open = function() {
	          if (this.isActive()) {
	            ActionCable.log("Attempted to open WebSocket, but existing socket is " + (this.getState()));
	            return false;
	          } else {
	            ActionCable.log("Opening WebSocket, current state is " + (this.getState()) + ", subprotocols: " + protocols);
	            if (this.webSocket != null) {
	              this.uninstallEventHandlers();
	            }
	            this.webSocket = new ActionCable.WebSocket(this.consumer.url, protocols);
	            this.installEventHandlers();
	            this.monitor.start();
	            return true;
	          }
	        };

	        Connection.prototype.close = function(arg) {
	          var allowReconnect, ref1;
	          allowReconnect = (arg != null ? arg : {
	            allowReconnect: true
	          }).allowReconnect;
	          if (!allowReconnect) {
	            this.monitor.stop();
	          }
	          if (this.isActive()) {
	            return (ref1 = this.webSocket) != null ? ref1.close() : void 0;
	          }
	        };

	        Connection.prototype.reopen = function() {
	          var error;
	          ActionCable.log("Reopening WebSocket, current state is " + (this.getState()));
	          if (this.isActive()) {
	            try {
	              return this.close();
	            } catch (error1) {
	              error = error1;
	              return ActionCable.log("Failed to reopen WebSocket", error);
	            } finally {
	              ActionCable.log("Reopening WebSocket in " + this.constructor.reopenDelay + "ms");
	              setTimeout(this.open, this.constructor.reopenDelay);
	            }
	          } else {
	            return this.open();
	          }
	        };

	        Connection.prototype.getProtocol = function() {
	          var ref1;
	          return (ref1 = this.webSocket) != null ? ref1.protocol : void 0;
	        };

	        Connection.prototype.isOpen = function() {
	          return this.isState("open");
	        };

	        Connection.prototype.isActive = function() {
	          return this.isState("open", "connecting");
	        };

	        Connection.prototype.isProtocolSupported = function() {
	          var ref1;
	          return ref1 = this.getProtocol(), indexOf.call(supportedProtocols, ref1) >= 0;
	        };

	        Connection.prototype.isState = function() {
	          var ref1, states;
	          states = 1 <= arguments.length ? slice.call(arguments, 0) : [];
	          return ref1 = this.getState(), indexOf.call(states, ref1) >= 0;
	        };

	        Connection.prototype.getState = function() {
	          var ref1, state, value;
	          for (state in WebSocket) {
	            value = WebSocket[state];
	            if (value === ((ref1 = this.webSocket) != null ? ref1.readyState : void 0)) {
	              return state.toLowerCase();
	            }
	          }
	          return null;
	        };

	        Connection.prototype.installEventHandlers = function() {
	          var eventName, handler;
	          for (eventName in this.events) {
	            handler = this.events[eventName].bind(this);
	            this.webSocket["on" + eventName] = handler;
	          }
	        };

	        Connection.prototype.uninstallEventHandlers = function() {
	          var eventName;
	          for (eventName in this.events) {
	            this.webSocket["on" + eventName] = function() {};
	          }
	        };

	        Connection.prototype.events = {
	          message: function(event) {
	            var identifier, message, ref1, type;
	            if (!this.isProtocolSupported()) {
	              return;
	            }
	            ref1 = JSON.parse(event.data), identifier = ref1.identifier, message = ref1.message, type = ref1.type;
	            switch (type) {
	              case message_types.welcome:
	                this.monitor.recordConnect();
	                return this.subscriptions.reload();
	              case message_types.ping:
	                return this.monitor.recordPing();
	              case message_types.confirmation:
	                return this.subscriptions.notify(identifier, "connected");
	              case message_types.rejection:
	                return this.subscriptions.reject(identifier);
	              default:
	                return this.subscriptions.notify(identifier, "received", message);
	            }
	          },
	          open: function() {
	            ActionCable.log("WebSocket onopen event, using '" + (this.getProtocol()) + "' subprotocol");
	            this.disconnected = false;
	            if (!this.isProtocolSupported()) {
	              ActionCable.log("Protocol is unsupported. Stopping monitor and disconnecting.");
	              return this.close({
	                allowReconnect: false
	              });
	            }
	          },
	          close: function(event) {
	            ActionCable.log("WebSocket onclose event");
	            if (this.disconnected) {
	              return;
	            }
	            this.disconnected = true;
	            this.monitor.recordDisconnect();
	            return this.subscriptions.notifyAll("disconnected", {
	              willAttemptReconnect: this.monitor.isRunning()
	            });
	          },
	          error: function() {
	            return ActionCable.log("WebSocket onerror event");
	          }
	        };

	        return Connection;

	      })();

	    }).call(this);
	    (function() {
	      var slice = [].slice;

	      ActionCable.Subscriptions = (function() {
	        function Subscriptions(consumer) {
	          this.consumer = consumer;
	          this.subscriptions = [];
	        }

	        Subscriptions.prototype.create = function(channelName, mixin) {
	          var channel, params, subscription;
	          channel = channelName;
	          params = typeof channel === "object" ? channel : {
	            channel: channel
	          };
	          subscription = new ActionCable.Subscription(this.consumer, params, mixin);
	          return this.add(subscription);
	        };

	        Subscriptions.prototype.add = function(subscription) {
	          this.subscriptions.push(subscription);
	          this.consumer.ensureActiveConnection();
	          this.notify(subscription, "initialized");
	          this.sendCommand(subscription, "subscribe");
	          return subscription;
	        };

	        Subscriptions.prototype.remove = function(subscription) {
	          this.forget(subscription);
	          if (!this.findAll(subscription.identifier).length) {
	            this.sendCommand(subscription, "unsubscribe");
	          }
	          return subscription;
	        };

	        Subscriptions.prototype.reject = function(identifier) {
	          var i, len, ref, results, subscription;
	          ref = this.findAll(identifier);
	          results = [];
	          for (i = 0, len = ref.length; i < len; i++) {
	            subscription = ref[i];
	            this.forget(subscription);
	            this.notify(subscription, "rejected");
	            results.push(subscription);
	          }
	          return results;
	        };

	        Subscriptions.prototype.forget = function(subscription) {
	          var s;
	          this.subscriptions = (function() {
	            var i, len, ref, results;
	            ref = this.subscriptions;
	            results = [];
	            for (i = 0, len = ref.length; i < len; i++) {
	              s = ref[i];
	              if (s !== subscription) {
	                results.push(s);
	              }
	            }
	            return results;
	          }).call(this);
	          return subscription;
	        };

	        Subscriptions.prototype.findAll = function(identifier) {
	          var i, len, ref, results, s;
	          ref = this.subscriptions;
	          results = [];
	          for (i = 0, len = ref.length; i < len; i++) {
	            s = ref[i];
	            if (s.identifier === identifier) {
	              results.push(s);
	            }
	          }
	          return results;
	        };

	        Subscriptions.prototype.reload = function() {
	          var i, len, ref, results, subscription;
	          ref = this.subscriptions;
	          results = [];
	          for (i = 0, len = ref.length; i < len; i++) {
	            subscription = ref[i];
	            results.push(this.sendCommand(subscription, "subscribe"));
	          }
	          return results;
	        };

	        Subscriptions.prototype.notifyAll = function() {
	          var args, callbackName, i, len, ref, results, subscription;
	          callbackName = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
	          ref = this.subscriptions;
	          results = [];
	          for (i = 0, len = ref.length; i < len; i++) {
	            subscription = ref[i];
	            results.push(this.notify.apply(this, [subscription, callbackName].concat(slice.call(args))));
	          }
	          return results;
	        };

	        Subscriptions.prototype.notify = function() {
	          var args, callbackName, i, len, results, subscription, subscriptions;
	          subscription = arguments[0], callbackName = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
	          if (typeof subscription === "string") {
	            subscriptions = this.findAll(subscription);
	          } else {
	            subscriptions = [subscription];
	          }
	          results = [];
	          for (i = 0, len = subscriptions.length; i < len; i++) {
	            subscription = subscriptions[i];
	            results.push(typeof subscription[callbackName] === "function" ? subscription[callbackName].apply(subscription, args) : void 0);
	          }
	          return results;
	        };

	        Subscriptions.prototype.sendCommand = function(subscription, command) {
	          var identifier;
	          identifier = subscription.identifier;
	          return this.consumer.send({
	            command: command,
	            identifier: identifier
	          });
	        };

	        return Subscriptions;

	      })();

	    }).call(this);
	    (function() {
	      ActionCable.Subscription = (function() {
	        var extend;

	        function Subscription(consumer, params, mixin) {
	          this.consumer = consumer;
	          if (params == null) {
	            params = {};
	          }
	          this.identifier = JSON.stringify(params);
	          extend(this, mixin);
	        }

	        Subscription.prototype.perform = function(action, data) {
	          if (data == null) {
	            data = {};
	          }
	          data.action = action;
	          return this.send(data);
	        };

	        Subscription.prototype.send = function(data) {
	          return this.consumer.send({
	            command: "message",
	            identifier: this.identifier,
	            data: JSON.stringify(data)
	          });
	        };

	        Subscription.prototype.unsubscribe = function() {
	          return this.consumer.subscriptions.remove(this);
	        };

	        extend = function(object, properties) {
	          var key, value;
	          if (properties != null) {
	            for (key in properties) {
	              value = properties[key];
	              object[key] = value;
	            }
	          }
	          return object;
	        };

	        return Subscription;

	      })();

	    }).call(this);
	    (function() {
	      ActionCable.Consumer = (function() {
	        function Consumer(url) {
	          this.url = url;
	          this.subscriptions = new ActionCable.Subscriptions(this);
	          this.connection = new ActionCable.Connection(this);
	        }

	        Consumer.prototype.send = function(data) {
	          return this.connection.send(data);
	        };

	        Consumer.prototype.connect = function() {
	          return this.connection.open();
	        };

	        Consumer.prototype.disconnect = function() {
	          return this.connection.close({
	            allowReconnect: false
	          });
	        };

	        Consumer.prototype.ensureActiveConnection = function() {
	          if (!this.connection.isActive()) {
	            return this.connection.open();
	          }
	        };

	        return Consumer;

	      })();

	    }).call(this);
	  }).call(this);

	  if (typeof module === "object" && module.exports) {
	    module.exports = ActionCable;
	  } else if (true) {
	    !(__WEBPACK_AMD_DEFINE_FACTORY__ = (ActionCable), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  }
	}).call(this);


/***/ })
/******/ ]);