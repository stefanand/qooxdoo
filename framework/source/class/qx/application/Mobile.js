"use strict";
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */

/**
 * For a mobile application. Supports the mobile widget set.
 *
 * @require(qx.core.Init)
 * @asset(qx/mobile/css/*)
 */
qx.Bootstrap.define("qx.application.Mobile",
{
  extend : qx.event.Emitter,
  implement : [qx.application.IApplication],


  events :
  {
    /** Fired when the lifecycle method {@link #start} of any {@link qx.ui.mobile.page.Page page} is called */
    "start" : null,


    /** Fired when the lifecycle method {@link #stop} of any {@link qx.ui.mobile.page.Page page} is called */
    "stop" : null,


    /**
     * Fired when the method {@link qx.ui.mobile.page.Page#back} is called. Data indicating
     * whether the action was triggered by a key event or not.
     */
    "back" : "Boolean",


    /** Fired when a {@link qx.ui.mobile.dialog.Popup popup} appears on screen. */
    "popup" : null
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */


  members :
  {
    __root : null,
    __routing : null,


    // interface method
    main : function() {},


    /**
     * Returns the application's root widget.
     *
     * @return {qx.ui.mobile.core.Widget} The application's root widget.
     */
    getRoot : function() {
      if (!this.__root) {
        this.__root = this._createRootWidget();

        if (qx.core.Environment.get("qx.mobile.nativescroll") == false) {
          this.__root.showScrollbarY = false;
        }
      }
      return this.__root;
    },


    setRoot : function(root) {
      this.__root = root;
    },


    /**
     * Returns the application's routing.
     *
     * @return {qx.application.Routing} The application's routing.
     */
    getRouting : function() {
      if(!this.__routing) {
        this.__routing = new qx.application.Routing();
      }
      return this.__routing;
    },


    /**
     * Creates the application's root widget. Override this function to create
     * your own root widget.
     *
     * @return {qx.ui.mobile.core.Widget} The application's root widget.
     */
    _createRootWidget : function() {
      return new qx.ui.mobile.core.Root();
    },


    // interface method
    close : function() {
      // empty
    },


    // interface method
    terminate : function() {
      // empty
    }
  }
});
