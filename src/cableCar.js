
export default class CableCar {
  constructor(cableProvider, store, options = {}) {
    if (typeof cableProvider === 'undefined') {
      throw new Error(`CableCar: unknown ActionCable provider: ${cableProvider}`);
    }

    if (typeof store === 'undefined' || typeof store.dispatch === 'undefined') {
      throw new Error(`CableCar: unknown store: ${store}`);
    }

    this.actionCableProvider = cableProvider;
    this.store = store;

    const defaultOptions = { prefix: 'RAILS', optimisticOnFail: false };
    this.initialize(Object.assign(defaultOptions, options));
  }

  initialize(options) {
    this.options = options;
    this.running = [];
    this.subscriptions = {};

    this.consumer = this.actionCableProvider.createConsumer(options.wsURL);
  }

  // ActionCable callback functions
  initialized = channel => this.dispatch({ type: 'CABLECAR_INITIALIZED', channel });

  connected = (channel) => {
    this.dispatch({ type: 'CABLECAR_CONNECTED', channel });
    const index = this.running.indexOf(channel);
    if (index === -1) {
      this.running.push(channel);
    }
    if (this.options.connected) { this.options.connected.call(channel); }
  }

  disconnected = (channel) => {
    this.dispatch({ type: 'CABLECAR_DISCONNECTED', channel });
    const index = this.running.indexOf(channel);
    if (index > -1) {
      this.running[index] = this.running[this.running.length - 1];
      this.running.pop();
    }
    if (this.options.disconnected) { this.options.disconnected.call(channel); }
  }

  received = (msg, channel) => {
    this.dispatch({ ...msg, channel });
  }

  rejected = (channel) => {
    throw new Error(
      `CableCar: Attempt to connect was rejected.
      (Channel: ${channel})`,
    );
  }

  subscribe(channel, params = {}) {
    this.subscriptions[channel] = this.consumer.subscriptions.create(
      Object.assign({ channel }, params), {
        initialized: () => this.initialized(channel),
        connected: () => this.connected(channel),
        disconnected: () => this.disconnected(channel),
        received: msg => this.received(msg, channel),
        rejected: () => this.rejected(channel),
      },
    );
  }

  // Redux dispatch function
  dispatch(action) {
    const newAction = Object.assign(action, {
      CableCar__Action: true,
    });
    this.store.dispatch(newAction);
  }

  allows(action) {
    if (typeof action !== 'object' || typeof action.type !== 'string') {
      throw new Error(`CableCar: ${action} is not a valid redux action ({ type: ... })`);
    }

    return this.matchPrefix(action.type);
  }

  matchPrefix(type) {
    const prefix = type.slice(0, this.options.prefix.length);
    return prefix === this.options.prefix;
  }

  // ActionCable subscription functions (exposed globally)
  changeChannel(channel, params = {}) {
    if (this.subscriptions[channel]) {
      this.unsubscribe(channel);
      this.subscribe(channel, params);
    } else {
      throw new Error(`CableCar: Unknown Channel ${channel} to change Channel`)
    }
  }

  getChannels() {
    return Object.keys(this.subscriptions);
  }

  perform(channel, method, payload) {
    if (this.subscriptions[channel]) {
      this.subscriptions[channel].perform(method, payload);
    } else {
      throw new Error(`CableCar: Unknown Channel ${channel} to call perform ${method}`)
    }
  }

  send(channel, action) {
    if (this.subscriptions[channel]) {
      this.subscriptions[channel].send(action);
    } else {
      throw new Error(`CableCar: Unknown Channel ${channel} to send ${action.type}`)
    }
  }

  unsubscribe(channel) {
    if (this.subscriptions[channel]) {
      this.subscriptions[channel].unsubscribe();
      delete this.subscriptions[channel];
      this.disconnected(channel);
    }
  }

  unsubscribeAll() {
    Object.keys(this.subscriptions).forEach((channel) => {
      this.unsubscribe(channel);
    });
  }
}
