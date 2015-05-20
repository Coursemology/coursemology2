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

Write your tests to be as compartmentalised from other tests as possible. Compartmentalised tests
are those that do not depend on any external state to run. This would allow tests to be run in 
parallel. 

## Developer Tools
The project's Gemfile contains a few developer tools to help keep the project tidy:

 - _Traceroute_ checks that the routes are properly defined and reachable.

## Models
Declare model attributes in the following order:

 1. includes (e.g. `include UserPasswordConcern`)
 2. callbacks
 3. attribute overrides (e.g. `enum`s)
 4. validations
 5. relations

This allows models to be inherited. See the section on _Inherited Callback Queues_ from
[`ActiveRecord::Callbacks`](http://api.rubyonrails.org/classes/ActiveRecord/Callbacks.html#module-ActiveRecord::Callbacks-label-Inheritable+callback+queues).

## Views
Remember to give useful page titles (using the `page_title` content helper). The current resource 
should always be clearly present at the start of the title (for users to quickly switch to the tab
when many tabs are open). Reverse breadcrumbs should be given, so that on browsers which allow
searching for a URL by page title, users can jump to a page by the location in the module. The 
Coursemology branding is automatically appended to all page titles.

Place all toolbar items dealing with a resource at the same baseline as the page header. On smaller
screens, the toolbar should wrap below the title.

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

## Libraries
The `lib` directory is not autoloaded, as described in this [blog post](http://hakunin.com/rails3-load-paths#if-you-add-code-in-your-lib-directory). However, the `lib/autoload`
directory is. Place libraries which will be autoloaded in that directory instead.

## Nested layouts
Following a paradigm similar to that described by [André Arko](http://andre.arko.net/2013/02/02/nested-layouts-on-rails--31/),
layouts can be nested. This is most visible when defining a global layout, and then a sub-layout
for course modules (with the sidebar). Our implementation is similar, but instead of an
application helper, we extend ActionView directly, so templates look like:

 ```ruby
 render within: 'parent_template' do
   | Extra pre-adornments
   = yield
   | Extra post-adornments
 end
 ```
