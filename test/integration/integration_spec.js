import { createStore, applyMiddleware } from 'redux';
import { expect, spy } from '../setup';
import middleware from '../../src/middleware';

describe('Integrated functionality -->', () => {
  // ACTION CABLE MOCKS
  let loggedServerActions = [];
  const mockSubscription = {
    perform: spy(),
    send: msg => { console.log(msg); loggedServerActions.push(msg.type)},
    unsubscribe: spy()
  };
  let ActionCableCalls;
  let ActionCableMockProvider;

  before(() => {
    ActionCableMockProvider = {
      createConsumer: () => ({
        subscriptions: {
          create: (params, callbacks) => {
            ActionCableCalls = callbacks;
            return mockSubscription;
          },
        },
      }),
    };
  });
  after(() => {
    ActionCableMockProvider = null;
  });

  // REDUX MOCKS
  let mystore;
  const mockReducer = (state = { value: 0 }, action) => {
    if (action.type === 'CHANGE_VALUE') {
      return { value: action.value };
    }

    return Object.assign({}, state);
  };
  let loggedClientActions = [];
  const actionLogger = store => next => (action) => {
    if (store) loggedClientActions.push(action.type);
    return next(action);
  };

  beforeEach(() => {
    mystore = createStore(
      mockReducer,
      { value: 0 },
      applyMiddleware(middleware, actionLogger),
    );
    loggedServerActions = [];
    loggedClientActions = [];
  });

  afterEach(() => {
    mystore.dispatch({ type: "CABLECAR_DESTROY_ALL" });
  })

  it('sends and receives the proper messages', () => {
    const options = { params: { room: 5 }, prefix: '' };
    middleware.setProvider(ActionCableMockProvider);
    const car = middleware.connect(mystore, options);
    car.subscribe('MyChannel', options.params);
    expect(mystore.getState().value).to.eq(0);
    mystore.dispatch({ type: 'dropped', channel: 'MyChannel' });
    ActionCableCalls.initialized('MyChannel');
    mystore.dispatch({ type: 'initialized but not connected', channel: 'MyChannel' });
    ActionCableCalls.connected('MyChannel');
    mystore.dispatch({ type: 'now cable car takes over', channel: 'MyChannel' });
    ActionCableCalls.disconnected('MyChannel');
    mystore.dispatch({ type: 'cable car is disconnected, but still exists', channel: 'MyChannel' });
    ActionCableCalls.connected('MyChannel');
    mystore.dispatch({ type: 'we are back', channel: 'MyChannel' });
    ActionCableCalls.received({ type: 'HELLO_FROM_SERVER' });
    ActionCableCalls.received({ type: 'CHANGE_VALUE', value: 100, channel: 'MyChannel' });
    expect(mystore.getState().value).to.eq(100);
    ActionCableCalls.received({
      type: 'CABLECAR_CHANGE_CHANNEL',
      newChannel: 'MyChannel',
      options: { room: 6 },
    });
    expect(car.getChannels()).to.deep.equals(['MyChannel']);
    ActionCableCalls.initialized('MyChannel');
    mystore.dispatch({ type: 'initialized but not connected', channel: 'MyChannel' });
    ActionCableCalls.connected('MyChannel');
    mystore.dispatch({ type: 'now cable car takes over', channel: 'MyChannel' });
    mystore.dispatch({ type: 'CABLECAR_DESTROY', channel: 'MyChannel' });
    mystore.dispatch({ type: 'works again as normal' });

    expect(loggedServerActions[0]).to.eq('now cable car takes over');
    expect(loggedServerActions[1]).to.eq('we are back');

    expect(loggedClientActions[0]).to.eq('CABLECAR_INITIALIZED');
    expect(loggedClientActions[1]).to.eq('CABLECAR_CONNECTED');
    expect(loggedClientActions[2]).to.eq('CABLECAR_DISCONNECTED');
    expect(loggedClientActions[3]).to.eq('CABLECAR_CONNECTED');
    expect(loggedClientActions[4]).to.eq('HELLO_FROM_SERVER');
    expect(loggedClientActions[5]).to.eq('CHANGE_VALUE');
    expect(loggedClientActions[6]).to.eq('CABLECAR_DISCONNECTED');
    expect(loggedClientActions[7]).to.eq('CABLECAR_INITIALIZED');
    expect(loggedClientActions[8]).to.eq('CABLECAR_CONNECTED');
    expect(loggedClientActions[9]).to.eq('CABLECAR_DISCONNECTED');
    expect(loggedClientActions[10]).to.eq('works again as normal');
    expect(loggedClientActions.length).to.eq(11);
  });

  it('prefixes: sends and receives the proper messages', () => {
    const options = { prefix: 'CABLECAR', params: { room: 5 } };
    middleware.setProvider(ActionCableMockProvider);
    const car = middleware.connect(mystore, options);
    car.subscribe('MyChannel', options.params);
    ActionCableCalls.initialized('MyChannel');
    ActionCableCalls.connected('MyChannel');
    mystore.dispatch({ type: 'CABLECAR_SENDING_TO_RAILS', payload: 'YES', channel: 'MyChannel' });
    mystore.dispatch({ type: 'SKIP_SERVER', payload: 'NO' });
    ActionCableCalls.received({
      type: 'CABLECAR_CHANGE_CHANNEL',
      newChannel: 'MyChannel',
      options: { room: 6 },
    });
    ActionCableCalls.connected('MyChannel');
    mystore.dispatch({ type: 'CABLECAR_SENDING_TO_RAILS_2', payload: 'YES', channel: 'MyChannel' });
    mystore.dispatch({ type: 'CABLECAR_NOW_REDUX_ONLY', payload: 'YES' });

    expect(loggedServerActions[0]).to.eq('CABLECAR_SENDING_TO_RAILS');
    expect(loggedServerActions[1]).to.eq('CABLECAR_SENDING_TO_RAILS_2');

    expect(loggedClientActions[0]).to.eq('CABLECAR_INITIALIZED');
    expect(loggedClientActions[1]).to.eq('CABLECAR_CONNECTED');
    expect(loggedClientActions[2]).to.eq('SKIP_SERVER');
    expect(loggedClientActions[3]).to.eq('CABLECAR_DISCONNECTED');
    expect(loggedClientActions[4]).to.eq('CABLECAR_CONNECTED');
    expect(loggedClientActions[5]).to.eq('CABLECAR_NOW_REDUX_ONLY');
  });
});
