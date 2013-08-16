
/**
  Debug Adapter port for Ember Persistence Foundation (EPF)
*/

var get = Ember.get, set  = Ember.set;
var capitalize = Ember.String.capitalize, underscore = Ember.String.underscore;

/**
  Extend `Ember.DataAdapter` with EPF specific code.
  https://github.com/emberjs/ember.js/blob/master/packages/ember-extension-support/lib/data_adapter.js

  The `DataAdapter` helps a data persistence library
  interface with tools that debug Ember such
  as the Chrome Ember Extension.

  This class will be extended by a persistence library
  which will override some of the methods with
  library-specific code.

  The methods likely to be overriden are
  `getFilters`, `detect`, `columnsForType`,
  `getRecords`, `getRecordColumnValues`,
  `getRecordKeywords`, `getRecordFilterValues`,
  `getRecordColor`, `observeRecord`

  The adapter will need to be registered
  in the application's container as `dataAdapter:main`

  Example:
  ```javascript
  Application.initializer({
    name: "dataAdapter",

    initialize: function(container, application) {
      application.register('dataAdapter:main', DS.DataAdapter);
    }
  });
  ```

  @class DebugAdapter
  @namespace Ep
  @extends Ember.DataAdapter
*/

Ep.DebugAdapter = Ember.DataAdapter.extend({


  /**
    Flag to enable console logging
  */
  enableLogging: true,
 
  /**
    Provide a hint of context in console
  */
  adapterClassName: "Ep.DebugAdapter",

  /**
    The container of the application being debugged.
    This property will be injected
    on creation.
  */
  container: null,

  /**
    @private

    Number of attributes to send
    as columns. (Enough to make the record
    identifiable).
  */
  attributeLimit: 3,

  /**
    @private

    Stores all methods that clear observers.
    These methods will be called on destruction.
  */
  releaseMethods: Ember.A(),


  logThis: function(methodName, args) {
    if (this.enableLogging) {
      console.log('%s called %s method', this.adapterClassName, methodName);
      console.log('arguments [%d]:\n*************', args.length);
      for(var a in args){
        console.log(args[a]);
      }
      console.log('*************');
   }

    return true;
  },


  /**
    @public

    Specifies how records can be filtered.
    Records returned will need to have a `filterValues`
    property with a key for every name in the returned array.

    @method getFilters
    @return {Array} List of objects defining filters.
     The object should have a `name` and `desc` property.
  */
  getFilters: function() {
    this.logThis('getFilters', arguments);


    return Ember.A();
  },

  /**
    @public

    Fetch the model types and observe them for changes.

    @method watchModelTypes

    @param {Function} typesAdded Callback to call to add types.
    Takes an array of objects containing wrapped types (returned from `wrapModelType`).

    @param {Function} typesUpdated Callback to call when a type has changed.
    Takes an array of objects containing wrapped types.

    @return {Function} Method to call to remove all observers
  */
  watchModelTypes: function(typesAdded, typesUpdated) {
    this.logThis('watchModelTypes', arguments);

    var modelTypes = this.getModelTypes(),
        self = this, typesToSend, releaseMethods = Ember.A();

    typesToSend = modelTypes.map(function(type) {
      var wrapped = self.wrapModelType(type);
      releaseMethods.push(self.observeModelType(type, typesUpdated));
      return wrapped;
    });

    typesAdded(typesToSend);

    var release = function() {
      releaseMethods.forEach(function(fn) { fn(); });
      self.releaseMethods.removeObject(release);
    };
    this.releaseMethods.pushObject(release);
    return release;
  },

  /**
    @public

    Fetch the records of a given type and observe them for changes.

    @method watchRecords

    @param {Function} recordsAdded Callback to call to add records.
    Takes an array of objects containing wrapped records.
    The object should have the following properties:
      columnValues: {Object} key and value of a table cell
      object: {Object} the actual record object

    @param {Function} recordsUpdated Callback to call when a record has changed.
    Takes an array of objects containing wrapped records.

    @param {Function} recordsRemoved Callback to call when a record has removed.
    Takes the following parameters:
      index: the array index where the records were removed
      count: the number of records removed

    @return {Function} Method to call to remove all observers
  */
  watchRecords: function(type, recordsAdded, recordsUpdated, recordsRemoved) {
    this.logThis('watchRecords', arguments);


    var self = this, releaseMethods = Ember.A(), records = this.getRecords(type), release;

    var recordUpdated = function(updatedRecord) {
      recordsUpdated([updatedRecord]);
    };

    var recordsToSend = records.map(function(record) {
      releaseMethods.push(self.observeRecord(record, recordUpdated));
      return self.wrapRecord(record);
    });


    var contentDidChange = function(array, idx, removedCount, addedCount) {
      for (var i = idx; i < idx + addedCount; i++) {
        var record = array.objectAt(i);
        var wrapped = self.wrapRecord(record);
        releaseMethods.push(self.observeRecord(record, recordUpdated));
        recordsAdded([wrapped]);
      }

      if (removedCount) {
        recordsRemoved(idx, removedCount);
      }
    };

    var observer = { didChange: contentDidChange, willChange: Ember.K };
    records.addArrayObserver(self, observer);

    release = function() {
      releaseMethods.forEach(function(fn) { fn(); });
      records.removeArrayObserver(self, observer);
      self.releaseMethods.removeObject(release);
    };

    recordsAdded(recordsToSend);

    this.releaseMethods.pushObject(release);
    return release;
  },

  /**
    @private

    Clear all observers before destruction
  */
  willDestroy: function() {
    this.logThis('willDestroy', arguments);

    this._super();
    this.releaseMethods.forEach(function(fn) {
      fn();
    });
  },

  /**
    @private

    Detect whether a class is a model.

    Test that against the model class
    of your persistence library

    @method detect
    @param {Class} klass The class to test
    @return boolean Whether the class is a model class or not
  */
  detect: function(klass) {
    this.logThis('detect', arguments);
    return false;
  },

  /**
    @private

    Get the columns for a given model type.

    @method columnsForType
    @param {Class} type The model type
    @return {Array} An array of columns of the following format:
     name: {String} name of the column
     desc: {String} Humanized description (what would show in a table column name)
  */
  columnsForType: function(type) {
    this.logThis('columnsForType', arguments);
    return Ember.A();
  },

  /**
    @private

    Adds observers to a model type class.

    @method observeModelType
    @param {Class} type The model type class
    @param {Function} typesUpdated Called when a type is modified.
    @return {Function} The function to call to remove observers
  */

  observeModelType: function(type, typesUpdated) {
    this.logThis('observeModelType', arguments);

    var self = this, records = this.getRecords(type);

    var onChange = function() {
      typesUpdated([self.wrapModelType(type)]);
    };
    var observer = {
      didChange: function() {
        Ember.run.scheduleOnce('actions', this, onChange);
      },
      willChange: Ember.K
    };

    records.addArrayObserver(this, observer);

    var release = function() {
      records.removeArrayObserver(self, observer);
    };

    return release;
  },


  /**
    @private

    Wraps a given model type and observes changes to it.

    @method wrapModelType
    @param {Class} type A model class
    @param {Function} typesUpdated callback to call when the type changes
    @return {Object} contains the wrapped type and the function to remove observers
    Format:
      type: {Object} the wrapped type
        The wrapped type has the following format:
          name: {String} name of the type
          count: {Integer} number of records available
          columns: {Columns} array of columns to describe the record
          object: {Class} the actual Model type class
      release: {Function} The function to remove observers
  */
  wrapModelType: function(type, typesUpdated) {
    this.logThis('wrapModelType', arguments);

    var release, records = this.getRecords(type),
        typeToSend, self = this;

    typeToSend = {
      name: type.toString(),
      count: Ember.get(records, 'length'),
      columns: this.columnsForType(type),
      object: type
    };


    return typeToSend;
  },


  /**
    @private

    Fetches all models defined in the application.
    TODO: Use the resolver instead of looping over namespaces.

    @method getModelTypes
    @return {Array} Array of model types
  */
  getModelTypes: function() {
    this.logThis('getModelTypes', arguments);

    var namespaces = Ember.A(Ember.Namespace.NAMESPACES), types = Ember.A(), self = this;

    namespaces.forEach(function(namespace) {
      for (var key in namespace) {
        if (!namespace.hasOwnProperty(key)) { continue; }
        var klass = namespace[key];
        if (self.detect(klass)) {
          types.push(klass);
        }
      }
    });
    return types;
  },

  /**
    @private

    Fetches all loaded records for a given type.

    @method getRecords
    @return {Array} array of records.
     This array will be observed for changes,
     so it should update when new records are added/removed.
  */
  getRecords: function(type) {
    this.logThis('getRecords', arguments);

    return Ember.A();
  },

  /**
    @private

    Wraps a record and observers changes to it

    @method wrapRecord
    @param {Object} record The record instance
    @return {Object} the wrapped record. Format:
    columnValues: {Array}
    searchKeywords: {Array}
  */
  wrapRecord: function(record) {
    this.logThis('wrapRecord', arguments);

    var recordToSend = { object: record }, columnValues = {}, self = this;

    recordToSend.columnValues = this.getRecordColumnValues(record);
    recordToSend.searchKeywords = this.getRecordKeywords(record);
    recordToSend.filterValues = this.getRecordFilterValues(record);
    recordToSend.color = this.getRecordColor(record);

    return recordToSend;
  },

  /**
    @private

    Gets the values for each column.

    @method getRecordColumnValues
    @return {Object} Keys should match column names defined
    by the model type.
  */
  getRecordColumnValues: function(record) {
    this.logThis('getRecordColumnValues', arguments);

    return {};
  },

  /**
    @private

    Returns keywords to match when searching records.

    @method getRecordKeywords
    @return {Array} Relevant keywords for search.
  */
  getRecordKeywords: function(record) {
    this.logThis('getRecordKeywords', arguments);

    return Ember.A();
  },

  /**
    @private

    Returns the values of filters defined by `getFilters`.

    @method getRecordFilterValues
    @param {Object} record The record instance
    @return {Object} The filter values
  */
  getRecordFilterValues: function(record) {
    this.logThis('getRecordFilterValues', arguments);

    return {};
  },

  /**
    @private

    Each record can have a color that represents its state.

    @method getRecordColor
    @param {Object} record The record instance
    @return {String} The record's color
      Possible options: black, red, blue, green
  */
  getRecordColor: function(record) {
    this.logThis('getRecordColor', arguments);

    return null;
  },

  /**
    @private

    Observes all relevant properties and re-sends the wrapped record
    when a change occurs.

    @method observerRecord
    @param {Object} record The record instance
    @param {Function} recordUpdated The callback to call when a record is updated.
    @return {Function} The function to call to remove all observers.
  */
  observeRecord: function(record, recordUpdated) {
    this.logThis('observeRecord', arguments);

    return function(){};
  }













  // getFilters: function() {
  //   return [
  //     { name: 'isPromise', desc: 'Promise' },
  //     { name: 'isProxy', desc: 'Proxy' },
  //     { name: 'isNew', desc: 'New' },
  //     { name: 'isDeleted', desc: 'Deleted' },
  //     { name: 'isLoaded', desc: 'Loaded' }
  //   ];
  // },


  // detect: function(klass) {
  //   return klass !== Ep.Model && Ep.Model.detect(klass);
  // },

  // columnsForType: function(type) {
  //   var columns = [{ name: 'id', desc: 'Id' }], count = 0, self = this;
  //   Ember.A(get(type, 'attributes')).forEach(function(name, meta) {
  //       if (count++ > self.attributeLimit) { return false; }
  //       var desc = capitalize(underscore(name).replace('_', ' '));
  //       columns.push({ name: name, desc: desc });
  //   });
  //   return columns;
  // },

  // getRecords: function(type) {
  //   console.log(DEBUG_ADAPTER + 'getRecords: function(type)' + type);

  //   // Using session.query(type, query) 
  //   // query parameter is optional hash of parameters to pass to the server 
  //   // This returns a promise of merged records from the session instance
  //   // var recordArray = this.get('store').query(type, {});
    
  //   // Using session.find(type, query) 
  //   // query optional hash of parameters to pass to the server 
  //   var recordArray = this.get('store').find(type, {});

  //   return recordArray;
  // },

  // getRecordColumnValues: function(record) {
  //   console.log(DEBUG_ADAPTER + 'getRecordColumnValues: function(record)' + record);
  //   var self = this, count = 0,
  //       columnValues = { id: get(record, 'id') };

  //   record.eachAttribute(function(key) {
  //     if (count++ > self.attributeLimit) {
  //       return false;
  //     }
  //     var value = get(record, key);
  //     columnValues[key] = value;
  //   });
  //   return columnValues;
  // },

  // getRecordKeywords: function(record) {
  //   console.log(DEBUG_ADAPTER + 'getRecordKeywords: function(record)' + record);
  //   var keywords = [], keys = Ember.A(['id']);
  //   record.eachAttribute(function(key) {
  //     keys.push(key);
  //   });
  //   keys.forEach(function(key) {
  //     keywords.push(get(record, key));
  //   });
  //   return keywords;
  // },

  // getRecordFilterValues: function(record) {
  //   console.log(DEBUG_ADAPTER + 'getRecordFilterValues: function(record)' + record);
  //   return {
  //     isPromise: record.get('isPromise'),
  //     isProxy: record.get('isProxy'),
  //     isNew: record.get('isNew'),
  //     isDeleted: record.get('isDeleted'),
  //     isLoaded: record.get('isLoaded')
  //   };
  // },

  // getRecordColor: function(record) {
  //   console.log(DEBUG_ADAPTER + DEBUG_ADAPTER + 'getRecordColor: function(record)' + record);
  //   var color = 'black';
  //   if (record.get('isNew')) {
  //     color = 'green';
  //   } else if (record.get('isProxy')) {
  //     color = 'blue';
  //   } else if (record.get('isPromise')) {
  //     color = 'red';
  //   }
  //   return color;
  // },

  // observeRecord: function(record, recordUpdated) {
  //   console.log(DEBUG_ADAPTER + 'observeRecord: function(record, recordUpdated)\n' + record + "\n" + recordUpdated);
  //   var releaseMethods = Ember.A(), self = this,
  //       keysToObserve = Ember.A(['id']);
  //       // keysToObserve = Ember.A(['id', 'isNew', 'isProxy', 'isPromise', 'isLoaded', 'isDeleted']);

  //   record.eachAttribute(function(key) {
  //     keysToObserve.push(key);
  //   });

  //   keysToObserve.forEach(function(key) {
  //     var handler = function() {
  //       recordUpdated(self.wrapRecord(record));
  //     };
  //     Ember.addObserver(record, key, handler);
  //     releaseMethods.push(function() {
  //       Ember.removeObserver(record, key, handler);
  //     });
  //   });

  //   var release = function() {
  //     releaseMethods.forEach(function(fn) { fn(); } );
  //   };

  //   return release;
  // }


});
