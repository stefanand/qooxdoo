/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/**
 * This class is used to define mixins (similar to mixins in Ruby).
 *
 * Mixins are collections of code and variables, which can be merged into
 * other classes. They are similar to classes but don't support inheritance.
 *
 * See the description of the {@link #define} method how a mixin is defined.
 */
qx.Bootstrap.define("qx.Mixin",
{
  statics :
  {
    /*
    ---------------------------------------------------------------------------
       PUBLIC API
    ---------------------------------------------------------------------------
    */

    /**
     * Define a new mixin.
     *
     * Example:
     * <pre class='javascript'>
     * qx.Mixin.define("name",
     * {
     *   include: [SuperMixins],
     *
     *   properties: {
     *     tabIndex: {type: "number", init: -1}
     *   },
     *
     *   members:
     *   {
     *     prop1: "foo",
     *     meth1: function() {},
     *     meth2: function() {}
     *   }
     * });
     * </pre>
     *
     * @param name {String} name of the mixin
     * @param config {Map ? null} Mixin definition structure. The configuration map has the following keys:
     *   <table>
     *     <tr><th>Name</th><th>Type</th><th>Description</th></tr>
     *     <tr><th>construct</th><td>Function</td><td>An optional mixin constructor. It is called on instantiation each
     *         class including this mixin. The constructor takes no parameters.</td></tr>
     *     <tr><th>destruct</th><td>Function</td><td>An optional mixin destructor.</td></tr>
     *     <tr><th>include</th><td>Mixin[]</td><td>Array of mixins, which will be merged into the mixin.</td></tr>
     *     <tr><th>statics</th><td>Map</td><td>
     *         Map of statics of the mixin. The statics will not get copied into the target class. They remain
     *         accessible from the mixin. This is the same behaviour as statics in interfaces ({@link qx.Interface#define}).
     *     </td></tr>
     *     <tr><th>members</th><td>Map</td><td>Map of members of the mixin.</td></tr>
     *     <tr><th>properties</th><td>Map</td><td>Map of property definitions. For a description of the format of a property definition see
     *           {@link qx.core.Property}.</td></tr>
     *     <tr><th>events</th><td>Map</td><td>
     *         Map of events the mixin fires. The keys are the names of the events and the values are
     *         corresponding event type classes.
     *     </td></tr>
     *   </table>
     *
     * @return {qx.Mixin} The configured mixin
     */
    define : function(name, config)
    {
      if (config)
      {
        // Normalize include
        if (config.include && !(qx.Bootstrap.getClass(config.include) === "Array")) {
          config.include = [config.include];
        }

        // Validate incoming data
        if (qx.core.Environment.get("qx.debug")) {
          this.__validateConfig(name, config);
        }

        // Create Interface from statics
        var mixin = config.statics ? config.statics : {};
        qx.Bootstrap.setDisplayNames(mixin, name);

        for(var key in mixin) {
          if (mixin[key] instanceof Function)
          {
            mixin[key].$$mixin = mixin;
          }
        }

        // Attach configuration
        if (config.construct)
        {
          mixin.$$constructor = config.construct;
          qx.Bootstrap.setDisplayName(config.construct, name, "constructor");
        }

        if (config.include) {
          mixin.$$includes = config.include;
        }

        if (config.properties) {
          mixin.$$properties = config.properties;
        }

        if (config.members)
        {
          mixin.$$members = config.members;
          qx.Bootstrap.setDisplayNames(config.members, name + ".prototype");
        }

        for(var key in mixin.$$members)
        {
          if (mixin.$$members[key] instanceof Function) {
            mixin.$$members[key].$$mixin = mixin;
          }
        }

        if (config.events) {
          mixin.$$events = config.events;
        }

        if (config.destruct)
        {
          mixin.$$destructor = config.destruct;
          qx.Bootstrap.setDisplayName(config.destruct, name, "destruct");
        }
      }
      else
      {
        var mixin = {};
      }

      // Add basics
      mixin.$$type = "Mixin";
      mixin.name = name;

      // Attach toString
      mixin.toString = this.genericToString;

      // Assign to namespace
      mixin.basename = qx.Bootstrap.createNamespace(name, mixin);

      // Store class reference in global mixin registry
      this.$$registry[name] = mixin;

      // Return final mixin
      return mixin;
    },

    /**
     * Include all features of the mixin into the given class, recursively.
     *
     * @param clazz {Class} The class onto which the mixin should be attached.
     * @param mixin {Mixin} Include all features of this mixin
     * @param patch {Boolean} Overwrite existing fields, functions and properties
     */
    add : function(clazz, mixin, patch)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        if (!clazz || !mixin) {
          throw new Error("Incomplete parameters!");
        }
      }

      if (this.getClassByMixin(clazz, mixin)) {
        return;
      }

      var isConstructorWrapped = clazz.$$original;
      if (mixin.$$constructor && !isConstructorWrapped) {
        clazz = this.__retrospectWrapConstruct(clazz);
      }

      // Attach content
      var list = qx.Mixin.flatten([mixin]);
      var entry;

      for (var i=0, l=list.length; i<l; i++)
      {
        entry = list[i];

        // Attach events
        if (entry.$$events) {
          //this.__addEvents(clazz, entry.$$events, patch); TODO?
        }

        // Attach properties (Properties are already readonly themselves, no patch handling needed)
        if (entry.$$properties) {
          qx.Bootstrap.addProperties(clazz.prototype, entry.$$properties, patch);
        }

        // Attach members (Respect patch setting, but dont apply base variables)
        if (entry.$$members) {
          qx.Bootstrap.addMembers(clazz.prototype, entry.$$members, patch, patch, patch);
        }
      }

      // Store mixin reference
      if (clazz.$$includes)
      {
        clazz.$$includes.push(mixin);
        clazz.$$flatIncludes.push.apply(clazz.$$flatIncludes, list);
      }
      else
      {
        clazz.$$includes = [mixin];
        clazz.$$flatIncludes = list;
      }
    },


    /**
     * Returns the class or one of its superclasses which contains the
     * declaration for the given mixin. Returns null if the mixin is not
     * specified anywhere.
     *
     * @param clazz {Class} class to look for the mixin
     * @param mixin {Mixin} mixin to look for
     * @return {Class | null} The class which directly includes the given mixin
     */
    getClassByMixin : function(clazz, mixin)
    {
      var list, i, l;

      while (clazz)
      {
        if (clazz.$$includes)
        {
          list = clazz.$$flatIncludes;

          for (i=0, l=list.length; i<l; i++)
          {
            if (list[i] === mixin) {
              return clazz;
            }
          }
        }

        clazz = clazz.superclass;
      }

      return null;
    },


    /**
     * Check compatibility between mixins (including their includes)
     *
     * @param mixins {Mixin[]} an array of mixins
     * @throws {Error} when there is a conflict between the mixins
     * @return {Boolean} <code>true</code> if the mixin passed the compatibilty check
     */
    checkCompatibility : function(mixins)
    {
      var list = this.flatten(mixins);
      var len = list.length;

      if (len < 2) {
        return true;
      }

      var properties = {};
      var members = {};
      var events = {};
      var mixin;

      for (var i=0; i<len; i++)
      {
        mixin = list[i];

        for (var key in mixin.events)
        {
          if(events[key]) {
            throw new Error('Conflict between mixin "' + mixin.name + '" and "' + events[key] + '" in member "' + key + '"!');
          }

          events[key] = mixin.name;
        }

        for (var key in mixin.properties)
        {
          if(properties[key]) {
            throw new Error('Conflict between mixin "' + mixin.name + '" and "' + properties[key] + '" in property "' + key + '"!');
          }

          properties[key] = mixin.name;
        }

        for (var key in mixin.members)
        {
          if(members[key]) {
            throw new Error('Conflict between mixin "' + mixin.name + '" and "' + members[key] + '" in member "' + key + '"!');
          }

          members[key] = mixin.name;
        }
      }

      return true;
    },


    /**
     * Wrap the constructor of an already existing clazz. This function will
     * replace all references to the existing constructor with the new wrapped
     * constructor.
     *
     * @param clazz {Class} The class to wrap
     * @return {Class} The wrapped class
     */
    __retrospectWrapConstruct : function(clazz)
    {
      var name = clazz.classname;
      var wrapper = qx.Class.wrapConstructor(clazz, name, clazz.$$classtype);

      // copy all keys from the wrapped constructor to the wrapper
      for (var i=0, a=Object.keys(clazz), l=a.length; i<l; i++)
      {
        key = a[i];
        wrapper[key] = clazz[key];
      }

      // fix prototype
      wrapper.prototype = clazz.prototype;

      // fix self references in members
      var members = clazz.prototype;
      for (var i=0, a=Object.keys(members), l=a.length; i<l; i++)
      {
        key = a[i];
        var method = members[key];

        // check if method is available because null values can be stored as
        // init values on classes e.g. [BUG #3709]
        if (method && method.self == clazz) {
          method.self = wrapper;
        }
      }

      // fix base and superclass references in all defined classes
      for(var key in this.$$registry)
      {
        var construct = this.$$registry[key];
        if (!construct) {
          continue;
        }

        if (construct.base == clazz) {
          construct.base = wrapper;
        }
        if (construct.superclass == clazz) {
          construct.superclass = wrapper;
        }

        if (construct.$$original)
        {
          if (construct.$$original.base == clazz) {
            construct.$$original.base = wrapper;
          }
          if (construct.$$original.superclass == clazz) {
            construct.$$original.superclass = wrapper;
          }
        }
      }
      qx.Bootstrap.createNamespace(name, wrapper);
      this.$$registry[name] = wrapper;

      return wrapper;
    },


    /**
     * Checks if a class is compatible to the given mixin (no conflicts)
     *
     * @param mixin {Mixin} mixin to check
     * @param clazz {Class} class to check
     * @throws {Error} when the given mixin is incompatible to the class
     * @return {Boolean} true if the mixin is compatible to the given class
     */
    isCompatible : function(mixin, clazz)
    {
      var list = qx.util.OOUtil.getMixins(clazz);
      list.push(mixin);
      return qx.Mixin.checkCompatibility(list);
    },


    /**
     * Returns a mixin by name
     *
     * @param name {String} class name to resolve
     * @return {Class} the class
     */
    getByName : function(name) {
      return this.$$registry[name];
    },


    /**
     * Generates a list of all mixins given plus all the
     * mixins these includes plus... (deep)
     *
     * @param mixins {Mixin[] ? []} List of mixins
     * @return {Array} List of all mixins
     * @internal
     */
    flatten : function(mixins)
    {
      if (!mixins) {
        return [];
      }

      // we need to create a copy and not to modify the existing array
      var list = mixins.concat();

      for (var i=0, l=mixins.length; i<l; i++)
      {
        if (mixins[i].$$includes) {
          list.push.apply(list, this.flatten(mixins[i].$$includes));
        }
      }

      return list;
    },





    /*
    ---------------------------------------------------------------------------
       PRIVATE/INTERNAL API
    ---------------------------------------------------------------------------
    */

    /**
     * This method will be attached to all mixins to return
     * a nice identifier for them.
     *
     * @internal
     * @return {String} The mixin identifier
     */
    genericToString : function() {
      return "[Mixin " + this.name + "]";
    },


    /** Registers all defined mixins */
    $$registry : {},


    /** @type {Map} allowed keys in mixin definition */
    __allowedKeys : qx.core.Environment.select("qx.debug",
    {
      "true":
      {
        "include"    : "object",   // Mixin | Mixin[]
        "statics"    : "object",   // Map
        "members"    : "object",   // Map
        "properties" : "object",   // Map
        "events"     : "object",   // Map
        "destruct"   : "function", // Function
        "construct"  : "function"  // Function
      },

      "default" : null
    }),


    /**
     * Validates incoming configuration and checks keys and values
     *
     * @signature function(name, config)
     * @param name {String} The name of the class
     * @param config {Map} Configuration map
     */
    __validateConfig : qx.core.Environment.select("qx.debug",
    {
      "true": function(name, config)
      {
        // Validate keys
        var allowed = this.__allowedKeys;
        for (var key in config)
        {
          if (!allowed[key]) {
            throw new Error('The configuration key "' + key + '" in mixin "' + name + '" is not allowed!');
          }

          if (config[key] == null) {
            throw new Error('Invalid key "' + key + '" in mixin "' + name + '"! The value is undefined/null!');
          }

          if (allowed[key] !== null && typeof config[key] !== allowed[key]) {
            throw new Error('Invalid type of key "' + key + '" in mixin "' + name + '"! The type of the key must be "' + allowed[key] + '"!');
          }
        }

        // Validate maps
        var maps = [ "statics", "members", "properties", "events" ];
        for (var i=0, l=maps.length; i<l; i++)
        {
          var key = maps[i];

          if (config[key] !== undefined &&
              ([
                 "Array",
                 "RegExp",
                 "Date"
               ].indexOf(qx.Bootstrap.getClass(config[key])) != -1 ||
               config[key].classname !== undefined)) {

            throw new Error('Invalid key "' + key + '" in mixin "' + name + '"! The value needs to be a map!');
          }
        }

        // Validate includes
        if (config.include)
        {
          for (var i=0, a=config.include, l=a.length; i<l; i++)
          {
            if (a[i] == null) {
              throw new Error("Includes of mixins must be mixins. The include number '" + (i+1) + "' in mixin '" + name + "'is undefined/null!");
            }

            if (a[i].$$type !== "Mixin") {
              throw new Error("Includes of mixins must be mixins. The include number '" + (i+1) + "' in mixin '" + name + "'is not a mixin!");
            }
          }

          this.checkCompatibility(config.include);
        }
      },

      "default" : function(name, config) {}
    })
  }
});
