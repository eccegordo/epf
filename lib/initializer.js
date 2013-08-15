var set = Ember.set;

/**
  This extension makes Ember.DefaultResolver resolve
  models without the `Model` suffix.

  E.g. @container.lookup("model:post") will now resolve
  to `App.Post` instead of `App.PostModel`.
*/
if(Ember.DefaultResolver) {
  Ember.DefaultResolver.reopen({
    resolveModel: function(parsedName) {
      var className = Ember.String.classify(parsedName.name);
      return Ember.get(parsedName.root, className);
    }
  });
}

/**
  Create the default injections.
*/
Ember.onLoad('Ember.Application', function(Application) {
  Application.initializer({
    name: "epf",

    initialize: function(container, application) {
      // Set the container to allow for static `find` methods on model classes
      Ep.__container__ = container;

      application.register('store:main', application.Store || Ep.Store);
      application.register('adapter:main', application.Adapter || Ep.RestAdapter);
      application.register('session:base', application.Session || Ep.Session, {singleton: false});
      application.register('session:child', application.ChildSession || Ep.ChildSession, {singleton: false});
      application.register('session:main', application.DefaultSession || Ep.Session);
      application.register('serializer:main', application.Serializer || Ep.RestSerializer);

      application.inject('adapter', 'serializer', 'serializer:main');
      application.inject('session', 'adapter', 'adapter:main');

      container.optionsForType('model', { instantiate: false });

      application.inject('controller', 'adapter', 'adapter:main');
      application.inject('controller', 'session', 'session:main');
      application.inject('route', 'adapter', 'adapter:main');
      application.inject('route', 'session', 'session:main');
    }
  });

  // Ep.DebugAdapter
  // provide interface for Chrome Ember-Extension 
  // https://github.com/tildeio/ember-extension
  // Provides a mechanism to debug data in the
  // developer view of chrome
  // Register the debug adapter
  // which is implemented in 
  // lib/debug/debug_adapter.js
  if (Ep.DebugAdapter) {
    Application.initializer({
      name: "dataAdapter",

      initialize: function(container, application) {
        application.register('dataAdapter:main', Ep.DebugAdapter);
      }
    });
  }

});
