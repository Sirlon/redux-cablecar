import CableCar from './cableCar';
//import CableCarDispatcher from './cableCarDispatcher';

let cableProvider;

let car

//const dispatcher = new CableCarDispatcher();

const middleware = store => next => (incomingAction) => {
  const action = incomingAction;

  switch (action.type) {

    case 'CABLECAR_INITIALIZED':
    case 'CABLECAR_CONNECTED':
    case 'CABLECAR_DISCONNECTED':
      return next(action);

    case 'CABLECAR_DESTROY':
      if (car) {
        car.unsubscribe(action.channel);
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
      return next(action);

    default:
      if (car && car.allows(action) && action.channel && !action.CableCar__Action) {
        if (car.running.indexOf(action.channel) > -1) {
          car.send(action.channel, action);
        } else {
          // eslint-disable-next-line no-console
          console.error('CableCar: Dropped action!',
            'Attempting to dispatch an action but cable car is not running.',
            action,
            `optimisticOnFail: ${car.options.optimisticOnFail}`);
          return car.options.optimisticOnFail ? next(action) : store.getState();
        }
        return action.optimistic ? next(action) : store.getState();
      }
      return next(action);
  }
};

middleware.connect = (store, options) => {
  if (!cableProvider) {
    try {
      // eslint-disable-next-line global-require
      cableProvider = require('actioncable');
    } catch (e) {
      throw new Error(`CableCar: No actionCableProvider set and 'actioncable' Node package failed to load: ${e}`);
    }
  }

  car = new CableCar(cableProvider, store, options);

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

middleware.setProvider = (newProvider) => {
  cableProvider = newProvider;
}

export default middleware;
