"use strict";
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */

/**
 * Representation of a form. A form widget can contain one or more {@link Row} widgets.
 *
 * *Example*
 *
 * Here is an example of how to use the widget.
 *
 * <pre class='javascript'>
 *   var title = new qx.ui.mobile.form.Title("Group");
 *   var form = new qx.ui.mobile.form.Form();
 *   form.app(new qx.ui.mobile.form.TextField(), "Username: ");
 *
 *   this.getRoot().append(title);
 *   this.getRoot().append(new qx.ui.mobile.form.renderer.Single(form));
 * </pre>
 *
 * This example creates a form and adds a row with a text field in it.
 */
qx.Class.define("qx.ui.mobile.form.Form",
{
  extend : qx.ui.mobile.Widget,


  construct : function(element)
  {
    this.base(qx.ui.mobile.Widget, "constructor", element);
    this.defaultCssClass = "form";
    this._resetter = this._createResetter();
    this.on("addedChild", this._onAddedChild, this);
    this.on("removedChild", this._onRemovedChild, this);
  },


  members :
  {
    _resetter : null,


    _getTagName : function() {
      return "form";
    },

    /**
     * Resets the form. This means reseting all form items and the validation.
     */
    reset : function() {
      this._resetter.reset();
    },


    /**
     * Redefines the values used for resetting. It calls
     * {@link qx.ui.form.Resetter#redefine} to get that.
     */
    redefineResetter : function() {
      this._resetter.redefine();
    },


    /**
     * Redefines the value used for resetting of the given item. It calls
     * {@link qx.ui.form.Resetter#redefineItem} to get that.
     *
     * @param item {qx.ui.core.Widget} The item to redefine.
     */
    redefineResetterItem : function(item) {
      this._resetter.redefineItem(item);
    },


    checkValidity: function() {
      return this[0].checkValidity();
    },


    /**
     * Creates and returns the used resetter.
     *
     * @return {qx.ui.mobile.form.Resetter} the resetter class.
     */
    _createResetter : function() {
      return new qx.ui.mobile.form.Resetter();
    },


    _onAddedChild: function(child) {
      if (this._resetter.getInitValue(child) !== undefined) {
        this._resetter.add(child);
      }
      var children = child.getChildren();
      for (var i = 0, l = children.length; i < l; i++) {
        var grandChild = qxWeb(children[i]);
        if (this._resetter.getInitValue(grandChild) !== undefined) {
          this._resetter.add(grandChild);
        }
      }
    },


    _onRemovedChild: function(child) {
      if (this._resetter.getInitValue(child) !== undefined) {
        this._resetter.remove(child);
      }
      var children = child.getChildren();
      for (var i = 0, l = children.length; i < l; i++) {
        var grandChild = qxWeb(children[i]);
        if (this._resetter.getInitValue(grandChild) !== undefined) {
          this._resetter.remove(grandChild);
        }
      }
    },


    dispose: function() {
      this.base(qx.ui.mobile.Widget, "dispose");
      this.off("addedChild", this._onAddedChild, this);
      this.off("removedChild", this._onRemovedChild, this);
    }

  }
});