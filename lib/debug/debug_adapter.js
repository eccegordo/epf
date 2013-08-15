/**
  Debug Adapter port for Ember Persistence Foundation (EPF)
*/

var get = Ember.get, set  = Ember.set;
var capitalize = Ember.String.capitalize, underscore = Ember.String.underscore;

/**
  Extend `Ember.DataAdapter` with EPF specific code.
*/
Ep.DebugAdapter = Ember.DataAdapter.extend({
  getFilters: function() {
    return [
      { name: 'isPromise', desc: 'Promise' },
      { name: 'isProxy', desc: 'Proxy' },
      { name: 'isNew', desc: 'New' },
      { name: 'isDeleted', desc: 'Deleted' },
      { name: 'isLoaded', desc: 'Loaded' }
    ];
  },

  detect: function(klass) {
    return klass !== Ep.Model && Ep.Model.detect(klass);
  },

  columnsForType: function(type) {
    var columns = [{ name: 'id', desc: 'Id' }], count = 0, self = this;
    Ember.A(get(type, 'attributes')).forEach(function(name, meta) {
        if (count++ > self.attributeLimit) { return false; }
        var desc = capitalize(underscore(name).replace('_', ' '));
        columns.push({ name: name, desc: desc });
    });
    return columns;
  },

  getRecords: function(type) {
    return this.get('session').query(type);
    // TODO: REMOVE
    // return this.get('store').all(type);
  },

  getRecordColumnValues: function(record) {
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

  getRecordKeywords: function(record) {
    var keywords = [], keys = Ember.A(['id']);
    record.eachAttribute(function(key) {
      keys.push(key);
    });
    keys.forEach(function(key) {
      keywords.push(get(record, key));
    });
    return keywords;
  },

  getRecordFilterValues: function(record) {
    return {
      isPromise: record.get('isPromise'),
      isProxy: record.get('isProxy'),
      isNew: record.get('isNew'),
      isDeleted: record.get('isDeleted'),
      isLoaded: record.get('isLoaded')
    };
  },

  getRecordColor: function(record) {
    var color = 'black';
    if (record.get('isNew')) {
      color = 'green';
    } else if (record.get('isProxy')) {
      color = 'blue';
    } else if (record.get('isPromise')) {
      color = 'red';
    }
    return color;
  },

  observeRecord: function(record, recordUpdated) {
    var releaseMethods = Ember.A(), self = this,
        keysToObserve = Ember.A(['id', 'isNew', 'isProxy', 'isPromise', 'isLoaded', 'isDeleted']);

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
