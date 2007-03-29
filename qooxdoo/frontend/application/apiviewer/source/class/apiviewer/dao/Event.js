/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#module(apiviewer)

************************************************************************ */


qx.Class.define("apiviewer.dao.Event", {
  extend : apiviewer.dao.ClassItem,

  construct : function(classDocNode, parentClass, listName)
  {
    this.base(arguments, classDocNode, parentClass, listName);
  },

  members : {

    getType : function () {
      return apiviewer.dao.Class.getClassByName(this._type);
    },

    getTypes : function () {
      if (this._type) {
        return [{
          type: this._type
        }]
      } else {
        return null;
      }
    },

    _initializeFields : function() {
      this.base(arguments);
    },

    _addChildNode : function(childNode)
    {
      switch (childNode.type) {
        case "types":
          this._type = childNode.children[0].attributes.type;
          break;
        default:
          return this.base(arguments, childNode);
      }
      return true;
    }

  }

});