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
 * A tab button widget.
 *
 * A tab button can be added to the tab bar and is associated with a
 * {@link #view}.
 */
qx.Bootstrap.define("qx.ui.mobile.tabbar.TabButton",
{
  extend : qx.ui.mobile.Button,

  properties :
  {
    /**
     * The associated view.
     */
    view :
    {
      check : "qx.ui.mobile.core.Widget",
      nullable : false,
      init : null,
      apply : "_applyView",
      event : true
    }
  },


  members :
  {
    // property apply
    _applyView : function(value, old) {
      value.exclude();
    }
  }
});
