import { expect, spy, stub } from '../setup';
import CableCar from '../../src/cableCar';

describe('CableCar', () => {
  // ACTION CABLE MOCK
  const mockStore = { dispatch: spy() };
  const mockSubscription = { perform: spy(), send: spy(), unsubscribe: spy() };
  const mockCreateFunc = stub().returns(mockSubscription);

  let mockCableProvider;

  before(() => {
    mockCableProvider = {
      createConsumer: () => ({ subscriptions: { create: mockCreateFunc } }),
    };
  });
  after(() => {
    mockCableProvider = null;
  });

  describe('constructor', () => {
    describe('when no cable provider is given', () => {
      it('throws an error', () => {
        expect(() => { new CableCar(undefined, mockStore, { opt1: 5 }) })
          .to.throw('CableCar: unknown ActionCable provider: undefined');
      });
    });
    it('sets the cable provider', () => {
      const cc = new CableCar(mockCableProvider, mockStore, { opt1: 5 });
      expect(cc.actionCableProvider).to.eq(mockCableProvider);
    });
    it('sets the store', () => {
      const cc = new CableCar(mockCableProvider, mockStore, { opt1: 5 });
      expect(cc.store).to.eq(mockStore);
    });
  });

  describe('#initialize', () => {

    it('sets the options', () => {
      const cc = new CableCar(mockCableProvider, mockStore, { opt1: 5 });
      expect(cc.options.opt1).to.eq(5);
    });
    it('sets the prefix', () => {
      const cc = new CableCar(mockCableProvider, mockStore, { prefix: 'MY_PREFIX' });
      expect(cc.options.prefix).to.eq('MY_PREFIX');
    });
    it('sets the default prefix "RAILS" if no options are provided', () => {
      const cc = new CableCar(mockCableProvider, mockStore);
      expect(cc.options.prefix).to.eq('RAILS');
    });
    it('sets the default prefix "RAILS" if options are provided (but no prefix)', () => {
      const cc = new CableCar(mockCableProvider, mockStore, { opt1: 5 });
      expect(cc.options.prefix).to.eq('RAILS');
    });
  });

  describe('#subscribe', () => {
    it('creates an ActionCable subscription with proper channel and params args', () => {
      const cc = new CableCar(mockCableProvider, mockStore, { params: { door: 5 } });
      cc.subscribe('channel', { door: 5 });
      expect(mockCreateFunc).to.have.been.calledWith({ channel: 'channel', door: 5 }, {
        initialized: () => cc.initialized('channel'),
        connected: () => cc.connected('channel'),
        disconnected: () => cc.disconnected('channel'),
        received: msg => cc.received(msg, 'channel'),
        rejected: () => cc.rejected('channel'),
      });
    });
  })

  describe('#changeChannel', () => {
    it('unsubscribes from the old subscription', () => {
      const cc = new CableCar(mockCableProvider, mockStore, { opt1: 5 });
      cc.subscribe('newChannel', { door: 6 });
      stub(cc, 'unsubscribe');
      stub(cc, 'subscribe');
      cc.changeChannel('newChannel', { door: 4 });
      expect(cc.unsubscribe).to.have.been.calledWith('newChannel');
    });
    it('subscribes a new subscription w/ new params', () => {
      const cc = new CableCar(mockCableProvider, mockStore);
      cc.subscribe('newChannel', { door: 6 });
      stub(cc, 'unsubscribe');
      stub(cc, 'subscribe');
      cc.changeChannel('newChannel', { door: 4 });
      expect(cc.subscribe).to.have.been.calledWith('newChannel', { door: 4 });
    });
  });

  describe('#dispatch', () => {
    it('adds flag CableCar__Action and channel flags', () => {
      const cc = new CableCar(mockCableProvider, mockStore, { opt1: 5 });
      cc.dispatch({});
      expect(mockStore.dispatch).to.have.been.calledWith({
        CableCar__Action: true,
      });
    });
  });
  describe('#initialized', () => {
    it('dispatches the action type: "CABLECAR_INITIALIZED"', () => {
      const cc = new CableCar(mockCableProvider, mockStore, { opt1: 5 });
      stub(cc, 'dispatch');
      cc.initialized('channel');
      expect(cc.dispatch).to.have.been.calledWith({ type: 'CABLECAR_INITIALIZED', channel: 'channel' });
    });
  });
  describe('#connected', () => {
    it('dispatches the action type: "CABLECAR_CONNECTED"', () => {
      const cc = new CableCar(mockCableProvider, mockStore, { opt1: 5 });
      stub(cc, 'dispatch');
      cc.connected('channel');
      expect(cc.dispatch).to.have.been.calledWith({ type: 'CABLECAR_CONNECTED', channel: 'channel' });
    });
    it('calls the callback if one exists', () => {
      const callback = spy();
      const cc = new CableCar(mockCableProvider, mockStore, { connected: callback });
      cc.connected('channel');
      expect(callback).to.have.been.calledWith();
    });
  });
  describe('#disconnected', () => {
    it('dispatches the action type: "CABLECAR_DISCONNECTED"', () => {
      const cc = new CableCar(mockCableProvider, mockStore, { opt1: 5 });
      stub(cc, 'dispatch');
      cc.disconnected('channel');
      expect(cc.dispatch).to.have.been.calledWith({ type: 'CABLECAR_DISCONNECTED', channel: 'channel' });
    });
    it('calls the callback if one exists', () => {
      const callback = spy();
      const cc = new CableCar(mockCableProvider, mockStore, { disconnected: callback });
      cc.disconnected('channel');
      expect(callback).to.have.been.calledWith();
    });
  });
  describe('#received', () => {
    it('dispatches the received msg', () => {
      const cc = new CableCar(mockCableProvider, mockStore, { opt1: 5 });
      cc.connected('channel');
      stub(cc, 'dispatch');
      cc.received({ type: 'message1'}, 'channel');
      expect(cc.dispatch).to.have.been.calledWith({ type: 'message1', channel: 'channel' });
    });
  });
  describe('#rejected', () => {
    it('throws an error message', () => {
      const cc = new CableCar(mockCableProvider, mockStore, { opt1: 5 });
      expect(cc.rejected).to.throw('CableCar: Attempt to connect was rejected');
    });
  });
  describe('#getChannels', () => {
    it('gets the channelNames (public fn)', () => {
      const cc = new CableCar(mockCableProvider, mockStore, { opt1: 5 });
      cc.subscribe('MyChannel');
      cc.subscribe('MyChannel2');
      expect(cc.getChannels()).to.deep.equal(['MyChannel', 'MyChannel2']);
    });
  });

  describe('#perform', () => {
    it('calls the #perform method of the ActionCable subscription', () => {
      const cc = new CableCar(mockCableProvider, mockStore, { opt1: 5 });
      cc.subscribe('channel');
      cc.perform('channel', 'action', 'data');
      expect(mockSubscription.perform).to.have.been.calledWith('action', 'data');
    });
  });
  describe('#send', () => {
    it('calls the #send method of the ActionCable subscription', () => {
      const cc = new CableCar(mockCableProvider, mockStore, { opt1: 5 });
      cc.subscribe('channel');
      cc.send('channel', 'action');
      expect(mockSubscription.send).to.have.been.calledWith('action');
    });
  });
  describe('#unsubscribe', () => {
    it('unsubscribes', () => {
      const cc = new CableCar(mockCableProvider, mockStore, { opt1: 5 });
      cc.subscribe('channel');
      stub(cc, 'disconnected');
      cc.unsubscribe('channel');
      expect(mockSubscription.unsubscribe).to.have.been.calledWith();
      expect(cc.disconnected).to.have.been.calledWith('channel');
    });
  });
});
