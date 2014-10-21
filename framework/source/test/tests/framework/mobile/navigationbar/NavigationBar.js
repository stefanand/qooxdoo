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

describe("mobile.navigationbar.NavigationBar", function()
{
  beforeEach( function () {
     setUpRoot();
  });

  afterEach( function (){
     tearDownRoot();
  });
   
  it("Create", function() {
      var bar = new qx.ui.mobile.navigationbar.NavigationBar();
      getRoot().append(bar);

      var back = new qx.ui.mobile.Button("Back");
      bar.append(back);

      var title = new qx.ui.mobile.navigationbar.Title("Title");
      bar.append(title);

      var button = new qx.ui.mobile.Button("Action");
      bar.append(button);

      assert.equal(3, bar.getChildren().length);

      back.dispose();
      title.dispose();
      button.dispose();
      bar.dispose();
    
  });

});