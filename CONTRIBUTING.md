# Contributing

## Code Style
Code styles are predefined in the RubyMine/IntelliJ project files. Also, the
[Rails Community Style Guide](https://github.com/bbatsov/ruby-style-guide) covers majority of the
styles that we use.

### Documentation
Write Yardoc when implementing classes. Yardoc is preferred because RubyMine is able to infer
parameter and return types when annotated using it.

Run `yard stats --list-undoc` to find which methods need documenting.

## Tests
Run tests using `rake spec`.

## Themes
Themes are provided by [themes_on_rails](https://github.com/yoolk/themes_on_rails). Coursemology
uses standard Bootstrap 3 styles, so it is possible to theme Coursemology using any Bootstrap 3
template. As a result, `assets/styles/application.css` is empty. This is to allow you to specify
your own styles in `themes/your-theme/styles/your-theme/all.css` by redefining Bootstrap-sass
variables and then including Bootstrap.

It also follows that because the application stylesheet has been deferred to themes, the base
Coursemology application _cannot_ define an application template. Coursemology instead implements a
`default` theme which contains the default application template and the default Bootstrap 3 styles.
Application components still implement their views in `app/views`, with themes given the option to
override them in the theme directory.

A sample theme (for [coursemology.org](http://coursemology.org)) can be found in the
[coursemology2-coursemology.org project]
(http://github.com/coursemology/coursemology2-coursemology.org-theme)
