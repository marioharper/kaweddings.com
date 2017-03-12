var classHelpers = require('./classHelpers');

module.exports = function ResponsiveMenu(menuDocumentElement) {

  _addOutsideClickEvent(menuDocumentElement);

  const module = {
    menu: menuDocumentElement,
    openClose: openClose
  }

  return module;

  /////////////////

  function openClose() {
    classHelpers.toggleClass(this.menu, 'open');
  }

	function _addOutsideClickEvent(menu){
		document.querySelector('html').onclick = function(){
			// close menu if its expanded and you click outside of it
      classHelpers.removeClass(menu, 'open');
		}

		menu.onclick = function(event){
			// dont close the menu if you click anywhere inside of it
			event.stopPropagation();
		}
	}
}