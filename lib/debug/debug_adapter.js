
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


  /**
    @private

    A utility method for logging the methods used in this class
    and output to console.log.

    This code should probably be isolated or stripped from production
    code. Not sure performance implications. Just attempting to debug
    do not depend on this, may be removed. 
  */
  _logThis: function(methodName, args) {
    if (this.enableLogging) {
      console.log('%s called %s method', this.adapterClassName, methodName);
      console.log('arguments [%d]:\n*************', args.length);
      for(var a in args){
        console.log(args[a]);
      }
      console.log('*************');
    }
    return;
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
    this._logThis('getFilters', arguments);
    return [
      { name: 'isPromise', desc: 'Promise' },
      { name: 'isProxy', desc: 'Proxy' },
      { name: 'isNew', desc: 'New' },
      { name: 'isDeleted', desc: 'Deleted' },
      { name: 'isLoaded', desc: 'Loaded' }
    ];
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
  /* USE Ember.DataAdapter DO NOT OVERIDE */ 
  /*

  watchModelTypes: function(typesAdded, typesUpdated) {
    this._logThis('watchModelTypes', arguments);

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

  */

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

  /* USE Ember.DataAdapter DO NOT OVERIDE */ 
  /*

  watchRecords: function(type, recordsAdded, recordsUpdated, recordsRemoved) {
    this._logThis('watchRecords', arguments);


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

  */

  /**
    @private

    Clear all observers before destruction
  */

  /* USE Ember.DataAdapter DO NOT OVERIDE */ 
  /*

  willDestroy: function() {
    this._logThis('willDestroy', arguments);

    this._super();
    this.releaseMethods.forEach(function(fn) {
      fn();
    });
  },

  */

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
    // This method is pretty chatty
    // So don't log it for now
    // this.logThis('detect', arguments);

    var isDetected = false;
    var isModel = false;
    var isModelDetect = false;

    // if (klass === Ep.Model) {
    //   isModel = true;
    // } else if ( Ep.Model.detect(klass) ) {
    //   isModelDetect = true;
    // } else {
    //   isDetected = false;
    // }

    if (klass === Ep.Model) {
      isModel = true;
    } 

    if ( Ep.Model.detect(klass) ) {
      isModelDetect = true;
    } 


    if (!isModel && isModelDetect ) {
      console.log("isModel: %s isModelDetect: %s klass: %s", isModel, isModelDetect, klass);  
      
      isDetected = true;
      // console.log("******** Detected Ep.Model *********");
      // console.log(klass);  
    }

    return isDetected;
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
    this._logThis('columnsForType', arguments);
    var columns = [{ name: 'id', desc: 'Id' }], count = 0, self = this;
    Ember.A(get(type, 'attributes')).forEach(function(name, meta) {
        if (count++ > self.attributeLimit) { return false; }
        var desc = capitalize(underscore(name).replace('_', ' '));
        columns.push({ name: name, desc: desc });
    });
    return columns;
  },

  /**
    @private

    Adds observers to a model type class.

    @method observeModelType
    @param {Class} type The model type class
    @param {Function} typesUpdated Called when a type is modified.
    @return {Function} The function to call to remove observers
  */

  /* USE Ember.DataAdapter DO NOT OVERIDE */ 
  /* only use if you want to handle the promise here */

/*

  observeModelType: function(type, typesUpdated) {
    this._logThis('observeModelType', arguments);

    var self = this, recordsPromised = this.getRecords(type), records = Ember.A([]); 

    var onChange = function() {
      typesUpdated([self.wrapModelType(type)]);
    };
    var observer = {
      didChange: function() {
        Ember.run.scheduleOnce('actions', this, onChange);
      },
      willChange: Ember.K
    };

    recordsPromised.then(
      function(values) {
        // the array was returned
        records = values;
      },
      function(error) {
        records = Ember.A([]); 
      });


    console.log("records after waiting for promise");
    console.log(records);
    console.log("******************"); 


    var release = function() {
      records.removeArrayObserver(self, observer);
    };

    return release;
    // return;
  },
*/

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

  /* USE Ember.DataAdapter DO NOT OVERIDE */ 
  /*

  wrapModelType: function(type, typesUpdated) {
    this._logThis('wrapModelType', arguments);

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

  */

  /**
    @private

    Fetches all models defined in the application.
    TODO: Use the resolver instead of looping over namespaces.

    @method getModelTypes
    @return {Array} Array of model types
  */

  /* USE Ember.DataAdapter DO NOT OVERIDE */ 
  /*

  getModelTypes: function() {
    this._logThis('getModelTypes', arguments);

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
  
  */

  /**
    @private

    Fetches all loaded records for a given type.

    @method getRecords
    @return {Array} array of records.
     This array will be observed for changes,
     so it should update when new records are added/removed.
  */
  getRecords: function(type) {
    this._logThis('getRecords', arguments);
    // return Ember.A();

    // return this.get('store').all(type);
    // original EmberData implementation relied on an "all" filter
    // defined in the Store class
    // https://github.com/emberjs/data/blob/master/packages/ember-data/lib/system/store.js
    // see below.

    // EPF needs to implement an all filter that functions in a similar way
    // Or else create a method to synchronously return array of
    // all items from a cache of the session 

    // Attempting to resolve promise here.
    // It seems we have the choice of resolving promise here.
    // Or else trying to do something in the method
    //
    // observeModelType
    //
    // that will gracefully deal with the data asynchronously

    var records = Ember.A([]),  
        recordsPromised = this.get('store').query(type);


    recordsPromised.then(
      function(values) {
        // the array was returned
        records = values;
      },
      function(error) {
        console.log("Error fetching recordsPromised...");
        console.log(error);
        // Way to think about how to handle this case
        // Sending blank array seems safest and most truthful.
        records = Ember.A([]); 
      });

    // debugger;
    return records; 
  },

/* ************************** */
  // This is the all function that is implemented in DS.Store class
  // https://github.com/emberjs/data/blob/master/packages/ember-data/lib/system/store.js
  /**
    This method returns a filtered array that contains all of the known records
    for a given type.

    Note that because it's just a filter, it will have any locally
    created records of the type.

    Also note that multiple calls to `all` for a given type will always
    return the same RecordArray.

    @method all
    @param {Class} type
    @return {DS.RecordArray}
  */

/*
  all: function(type) {
    var typeMap = this.typeMapFor(type),
        findAllCache = typeMap.findAllCache;

    if (findAllCache) { return findAllCache; }

    var array = DS.RecordArray.create({
      type: type,
      content: Ember.A(),
      store: this,
      isLoaded: true
    });

    this.recordArrayManager.registerFilteredRecordArray(array, type);

    typeMap.findAllCache = array;
    return array;
  },

*/
/* ************************** */

  /**
    @private

    Wraps a record and observers changes to it

    @method wrapRecord
    @param {Object} record The record instance
    @return {Object} the wrapped record. Format:
    columnValues: {Array}
    searchKeywords: {Array}
  */

  /* USE Ember.DataAdapter DO NOT OVERIDE */ 
  /*

  wrapRecord: function(record) {
    this._logThis('wrapRecord', arguments);

    var recordToSend = { object: record }, columnValues = {}, self = this;

    recordToSend.columnValues = this.getRecordColumnValues(record);
    recordToSend.searchKeywords = this.getRecordKeywords(record);
    recordToSend.filterValues = this.getRecordFilterValues(record);
    recordToSend.color = this.getRecordColor(record);

    return recordToSend;
  },

  */

  /**
    @private

    Gets the values for each column.

    @method getRecordColumnValues
    @return {Object} Keys should match column names defined
    by the model type.
  */
  getRecordColumnValues: function(record) {
    this._logThis('getRecordColumnValues', arguments);

    // return {};

    var self = this, count = 0,
        columnValues = { id: get(record, 'id') };

    record.eachAttribute(function(key) {
      if (count++ > self.attributeLimit) {
        return false;
      }
      var value = get(record, key);
      columnValues[key] = value;
    });
    return columnValues;
  },

  /**
    @private

    Returns keywords to match when searching records.

    @method getRecordKeywords
    @return {Array} Relevant keywords for search.
  */
  getRecordKeywords: function(record) {
    this._logThis('getRecordKeywords', arguments);

    // return Ember.A();

    var keywords = [], keys = Ember.A(['id']);
    record.eachAttribute(function(key) {
      keys.push(key);
    });
    keys.forEach(function(key) {
      keywords.push(get(record, key));
    });
    return keywords;
  },

  /**
    @private

    Returns the values of filters defined by `getFilters`.

    @method getRecordFilterValues
    @param {Object} record The record instance
    @return {Object} The filter values
  */
  getRecordFilterValues: function(record) {
    this._logThis('getRecordFilterValues', arguments);

    // return {};

    return {
      isPromise: record.get('isPromise'),
      isProxy: record.get('isProxy'),
      isNew: record.get('isNew'),
      isDeleted: record.get('isDeleted'),
      isLoaded: record.get('isLoaded')
    };
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
    this._logThis('getRecordColor', arguments);

    // return null;
    var color = 'black';

    // Records that are not yet loaded should be greyed out
    if (record.get('isLoaded') === false) {
      color = 'grey';
      return color;
    }


    if (record.get('isNew')) {
      color = 'green';
    } else if (record.get('isProxy')) {
      color = 'black';
    } else if (record.get('isNew')) {
      color = 'blue';
    } else if (record.get('isDeleted')) {
      color = 'red';
    }
    return color;    
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
    this._logThis('observeRecord', arguments);

    // return function(){};

    var releaseMethods = Ember.A(), self = this,
        keysToObserve = Ember.A(['id', 'isNew', 'isDirty']);

    record.eachAttribute(function(key) {
      keysToObserve.push(key);
    });

    keysToObserve.forEach(function(key) {
      var handler = function() {
        recordUpdated(self.wrapRecord(record));
      };
      Ember.addObserver(record, key, handler);
      releaseMethods.push(function() {
        Ember.removeObserver(record, key, handler);
      });
    });

    var release = function() {
      releaseMethods.forEach(function(fn) { fn(); } );
    };

    return release;

  }

});
