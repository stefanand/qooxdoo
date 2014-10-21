"use strict";
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */

/**
 * Basic implementation for an event emitter. This supplies a basic and
 * minimalistic event mechanism.
 */
qx.Mixin.define("qx.event.MEmitter",
{
  statics : {
    /** global id for all events */
    __storageId : 0
  },

  members :
  {
    __listener : null,
    __any : null,


    /**
     * Attach a listener to the event emitter. The given <code>name</code>
     * will define the type of event. Handing in a <code>'*'</code> will
     * listen to all events emitted by the event emitter.
     *
     * @param name {String} The name of the event to listen to.
     * @param listener {Function} The function execute on {@link #emit}.
     * @param ctx {var?Window} The context of the listener.
     * @return {Integer} An unique <code>id</code> for the attached listener.
     */
    on : function(name, listener, ctx) {
      this.$$lastListenerId = qx.event.MEmitter.__storageId++;
      this._getStorage(name)[this.$$lastListenerId] = {
        name: name,
        listener: listener,
        ctx: ctx,
        id: this.$$lastListenerId
      };
      return this.$$lastListenerId;
    },


    /**
     * Attach a listener to the event emitter which will be executed only once.
     * The given <code>name</code> will define the type of event. Handing in a
     * <code>'*'</code> will listen to all events emitted by the event emitter.
     *
     * @param name {String} The name of the event to listen to.
     * @param listener {Function} The function execute on {@link #emit}.
     * @param ctx {var?Window} The context of the listener.
     * @return {Integer} An unique <code>id</code> for the attached listener.
     */
    once : function(name, listener, ctx) {
      this.$$lastListenerId = qx.event.MEmitter.__storageId++;
      this._getStorage(name)[this.$$lastListenerId] = {
        name: name,
        listener: listener,
        ctx: ctx,
        once: true,
        id: this.$$lastListenerId
      };
      return this.$$lastListenerId;
    },


    /**
     * Remove a listener from the event emitter. The given <code>name</code>
     * will define the type of event.
     *
     * @param name {String} The name of the event to listen to.
     * @param listener {Function} The function execute on {@link #emit}.
     * @param ctx {var?Window} The context of the listener.
     * @return {Integer|null} The listener's id if it was removed or
     * <code>null</code> if it wasn't found
     */
    off : function(name, listener, ctx) {
      var storage = this._getStorage(name);
      var foundId;
      storage.forEach(function(entry, i, storage) {
        if (entry.listener == listener && entry.ctx == ctx) {
          storage.splice(i, 1);
          foundId = entry.id;
          return;
        }
      });
      return foundId === undefined ? null : foundId;
    },


    /**
     * Removes the listener identified by the given <code>id</code>. The id
     * will be return on attaching the listener and can be stored for removing.
     *
     * @param id {Integer} The id of the listener.
     * @return {Map|null} The listener's id if it was removed or
     * <code>null</code> if it wasn't found
     */
    offById : function(id) {
      var entry = this.getEntryById(id);
      if (entry) {
        this.off(entry.name, entry.listener, entry.ctx);
        return entry.id;
      }
      return null;
    },


    /**
     * Returns the id of the last added listener.
     * @return {Number} The last added id.
     */
    getListenerId : function() {
      return this.$$lastListenerId;
    },


    /**
     * Emits an event with the given name. The data will be passed
     * to the listener.
     * @param name {String} The name of the event to emit.
     * @param data {var?undefined} The data which should be passed to the listener.
     */
    emit : function(name, data) {
      var storage = this._getStorage(name);
      storage.forEach(function(entry) {
        entry.listener.call(entry.ctx, data);
        if (entry.once) {
          storage.splice(storage.indexOf(entry), 1);
        }
      });

      // call on any
      storage = this._getStorage("*");
      storage.forEach(function(entry) {
        entry.listener.call(entry.ctx, data);
      });
    },


    /**
     * Checks if the given lister is already attached.
     *
     * @param name {String} The name of the event to check.
     * @param listener {Function} The function execute on {@link #emit}.
     * @param ctx {var?Window} The context of the listener.
     * @return {Boolean} <code>true</code>, if the listener is already attached
     */
    hasListener : function(name, listener, context) {
      var storage = this._getStorage(name);
      if (storage.length === 0) {
        return false;
      }

      if (listener) {
        storage.forEach(function(stored) {
          if (stored.listener === listener) {
            if (!context) {
              return true;
            } else {
              if (stored.ctx === context) {
                return true;
              }
            }
          }
        });
        return false;
      }

      return true;
    },


    /**
     * Returns the internal attached listener.
     * @internal
     * @return {Map} A map which has the event name as key. The values are
     *   arrays containing a map with 'listener' and 'ctx'.
     */
    getListeners : function() {
      return this.__listener;
    },


    /**
     * Returns the data entry for a given event id. If the entry could
     * not be found, undefined will be returned.
     * @internal
     * @param id {Number} The listeners id
     * @return {Map|undefined} The data entry if found
     */
    getEntryById : function(id) {
      for (var name in this.__listener) {
        var store = this.__listener[name];
        if (store[id]) {
          return store[id];
        }
      }
    },


    /**
     * Internal helper which will return the storage for the given name.
     * @param name {String} The name of the event.
     * @return {Array} An array which is the storage for the listener and
     *   the given event name.
     */
    _getStorage : function(name) {
      if (this.__listener == null) {
        this.__listener = {};
      }
      if (this.__listener[name] == null) {
        this.__listener[name] = [];
      }
      return this.__listener[name];
    }
  }
});