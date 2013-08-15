require("../model/model");

Ep.Model.reopenClass({

  /**
   Provides info about the model for debugging purposes
   by grouping the properties into more semantic groups.

   Meant to be used by debugging tools such as the Chrome Ember Extension.

   - Groups all attributes in "Attributes" group.
   - Groups all belongsTo relationships in "Belongs To" group.
   - Groups all hasMany relationships in "Has Many" group.
   - Groups all flags in "Flags" group.
   - Flags relationship CPs as expensive properties.
  */
  _debugInfo: function() {
    var attributes = ['id'],
        relationships = { belongsTo: [], hasMany: [] },
        expensiveProperties = [];

    this.eachAttribute(function(name, meta) {
      attributes.push(name);
    }, this);

    this.eachRelationship(function(name, relationship) {
      relationships[relationship.kind].push(name);
      expensiveProperties.push(name);
    });

    var groups = [
      {
        name: 'Attributes',
        properties: attributes,
        expand: true,
      },
      {
        name: 'Belongs To',
        properties: relationships.belongsTo,
        expand: true
      },
      {
        name: 'Has Many',
        properties: relationships.hasMany,
        expand: true
      },
// TODO: Review code
// EPF is not backed by state machine (I don't think) 
// So this probably doesn't apply 
      {
        name: 'Flags',
        properties: ['isNew', 'isProxy', 'isPromise', 'isLoaded', 'isDeleted']
      }
    ];
    return {
      propertyInfo: {
        // include all other mixins / properties (not just the grouped ones)
        includeOtherProperties: true,
        groups: groups,
        // don't pre-calculate unless cached
        expensiveProperties: expensiveProperties
      }
    };
  }

});