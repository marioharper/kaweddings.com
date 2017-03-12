const Nav = require('./modules/responsiveMenu');
const classHelpers = require('./modules/classHelpers');

var navElement = document.getElementById('main-menu');

window.nav = new Nav(navElement);
