var appRoot = 'src/';
var outputRoot = 'dist/';

module.exports = {
	root: appRoot,
	html: [
		appRoot + "**/*.html",
    "!" + appRoot + "**/partials/**",
		"!" + appRoot + "**/templates/**",
	],
	css: appRoot + "assets/styles/**/*.css",
	sass: appRoot + "assets/styles/**/*.scss",
  img: appRoot + "assets/images/**/*.{ico,png,jpg,jpeg}",
  js: appRoot + "assets/js/**/*.bundle.js",
  output: outputRoot
}