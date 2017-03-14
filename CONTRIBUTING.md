# Contributing

## Code Style
Code styles are predefined in the RubyMine/IntelliJ project files. Also, the
[Rails Community Style Guide](https://github.com/bbatsov/ruby-style-guide) covers majority of the
styles that we use.

Our frontend code style follows Airbnb's [JavaScript](https://github.com/airbnb/javascript) and
[React](https://github.com/airbnb/javascript/tree/master/react) style guide. Run `yarn lint` in the
client folder and fix all issues before making a pull request.

### Documentation
Write Yardoc when implementing classes. Yardoc is preferred because RubyMine is able to infer
parameter and return types when annotated using it.

Run `yard stats --list-undoc` to find which methods need documenting.

## Tests
Run tests using `rake spec`. You need [PhantomJS](http://phantomjs.org/) to run the tests. We use
lvh.me to simulate tenants, thanks [levicook](http://github.com/levicook)!

Tests should always use `I18n.t()` to indicate translatable strings. In test mode, the strings
are stubbed out so variable interpolations are not used. This is to simplify testing and reducing
the brittleness of the tests against changing translations and arguments.

Try to group tests according to their purpose. Feature tests should be namespaced using colons
for tidiness (e.g. `Courses: Users`)

Write your tests to be as compartmentalised from other tests as possible. Compartmentalised tests
are those that do not depend on any external state to run. This would allow tests to be run in
parallel.

When defining constants, by default all constants would go to the global namespace and
potentially cause your specs to interfere with each other. To overcome this,
[prefix all constants with `self::`](http://stackoverflow.com/a/6025300).

In Rails, controller specs will always execute the `rescue_from` handlers. In our specs, we
disable that by default; to execute controllers with the handlers enabled, declare `run_rescue`
within the example group.

In development mode and when running specs, ActiveJob jobs are run with the `:background_thread`
queue adapter (see `lib/autoload/active_job/queue_adapters`). This is to ensure consistency with
production (where we will be using a separate jobs server): running jobs inline might cause
database connections within the job to remain within a transaction.

Therefore, specs have a group helper `with_active_job_queue_adapter`, which takes the queue
adapter to use for that group of examples. The only adapters which should be used is:

 - `:test` when counting the number of enqueued jobs.
 - `:background_thread` when running job specs. `spec/support/active_job.rb` automatically sets
   the default queue adapter to be `:test` when running job specs.

There is no longer a need to explicitly set the `:inline` adapter for delayed delivery of mail.
When running specs, all deferred mail deliveries are converted to immediate deliveries to keep
track of the number of pending mail deliveries.

Trackable Jobs can be waited -- use the `TrackableJob#wait` method.

### Frontend
`enzyme` and `jest` are used for frontend testing. All test files should be put under a folder
named `__test__`, which is excluded by webpack from the main bundler.

#### Unit tests
To do unit tests on components, we use Enzyme's `shallow` rendering to render the component, then
use jest's `expect` together with the [snapshot](https://facebook.github.io/jest/docs/snapshot-testing.html) 
feature to assert the component's state given different inputs/props.

#### Integration tests
When writing integration tests, ensure that all components including `redux` (actions, reducers, etc)
and `react-router` are tested. Note that there is no server when running the front-end tests, hence
all server API calls to get data should be mocked. To test if the components make the correct API call,
use `jest`'s `spy` function to ensure that the API is called with the correct parameters.

Enzyme's `mount` rendering should be used in integration tests. Where possible, avoid snapshots of
the `mount` rendered components. This is because the output of `mount` is large, unreadable, and
results in tests becoming implicit as they are only assertions of the snapshots.

## Developer Tools
The project's Gemfile contains a few developer tools to help keep the project tidy:

 - _Traceroute_ checks that the routes are properly defined and reachable.
 - _i18n-tasks_ checks that the localisations are all defined and used.

## Models
Declare model attributes in the following order:

 1. includes (e.g. `include UserPasswordConcern`)
 2. declarations (e.g. `acts_as :superclass`, `stampable`)
 3. callbacks
 4. attribute overrides (e.g. `enum`s, workflows)
 5. validations. **Exception**: when the validation is over a collection association, this
    validation needs to be placed _after_ the association so that the validation is not
    overwritten by the association model's validations.
 6. associations
 7. calculated fields
 8. scopes

This allows models to be inherited. See the section on _Inherited Callback Queues_ from
[`ActiveRecord::Callbacks`](http://api.rubyonrails.org/classes/ActiveRecord/Callbacks.html#module-ActiveRecord::Callbacks-label-Inheritable+callback+queues).

Take note that workflows do *not* persist their state, `save` needs to be called on the record.
See `lib/extensions/deferred_workflow_state_persistence`.

### Abilities
When declaring [cancancan](https://github.com/CanCanCommunity/cancancan) abilities, use only hashes. Do not define an ability using a block as cancancan only allows a single `can` statement for a model if a block is used. If we use hashes, we can write multiple `can` statements and cancancan will combine them.

## Views
The same code style for Ruby code applies to all views (e.g. single quotes unless interpolations
are used.) There is no linting for views at this point, but that might change in future.

By default, page titles will be generated by reversing breadcrumbs, so the name of current resource
will always be clearly present at the start of the title (for users to quickly switch to the tab
when many tabs are open). This will also allow users to jump to a page by the location in the
module.

Custom page titles can be specified in views with `content_for(:page_title, 'title here')`. If
present they will override the default titles.

The Coursemology branding will automatically be appended to all page titles.

Use the `page_header` helper in resource `index` pages. All toolbar items dealing with a resource
should be placed in the block that `page_header` accepts. On smaller screens, the toolbar should
wrap below the title.

Use `content_tag_for` or `div_for` helper whenever you want to present an active_record object (such
as in lists/tables). This makes your code more readable and enforces the consistency in views.

When specifying the class list of tags in templates or helpers, specify them as an array over a
space-delimited list. This allows other parts of the view rendering pipeline to modify the set of
classes which should be applied to an element. Use the Slim shorthand for classes, where possible.

When displaying translations for long stretches of text (e.g. a paragraph), use Rails'
`simple_format` view helper to present the text. This automatically paragraphs the translations.

When displaying user input, use the formatting helpers in
`app/helpers/application_formatters_helper.rb`. This would apply HTML sanitisation, automatic
linking to URL-like strings, etc.

When using Simple Form remember to declare `f.error_notification`.

`simple_form_for`, `simple_fields_for`, and associated methods (`f.input`, etc.) should be called
without parentheses.

## Assets
Webpack is used to manage assets (rather than the Rails default asset pipeline).
With webpack and some helpers, you are able to specify javascript that will be loaded on
specific pages. When including javascript files in specific pages, use the following convention:

- To include javascript in Course::LessonPlanController, add in
`client/app/bundlers/course/lesson_plan.js`

## Controllers

Controller actions (`render`, `redirect_to`) should be called without parentheses.

Arrange controller methods for Rails' default routes in the following order:
 1. `index`
 2. `show`
 3. `new`
 4. `create`
 5. `edit`
 6. `update`
 7. `destroy`

Add all other non REST-ful controller actions after these methods.

Arrange private controller methods in the following order:
 1. All `params` methods
 2. Callbacks - `before_action` and `after_action`  
 3. Any other helper methods for the controller


## Breadcrumbs
Remember to specify page breadcrumbs in **controllers** with the `add_breadcrumb` helper.

Controllers which involve resources should have breadcrumbs for all relevant actions. These are
specified in individual **views**.

Actions which involve a resource member (`show`, `edit`) should have breadcrumb text which describes
the resource, e.g. showing its title or name.

## Themes
Themes are provided by [themes_on_rails](https://github.com/yoolk/themes_on_rails). Coursemology
uses standard Bootstrap 3 styles, so it is possible to theme Coursemology using any Bootstrap 3
template.

Bootstrap is included in `assets/styles/application.scss`. Coursemology's markup is semantically
written, modulo extras that Bootstrap requires to work. Themes should therefore `@import
'application';` in their theme stylesheets, and override the base styles there.

It also follows that because the application stylesheet has been deferred to themes, the base
Coursemology application _cannot_ define an application template. Coursemology instead implements a
`default` theme which contains the default application template and the default Bootstrap 3 styles.
Application components still implement their views in `app/views`, with themes given the option to
override them in the theme directory.

A sample theme (for [coursemology.org](http://coursemology.org)) can be found in the
[coursemology-theme project](https://github.com/Coursemology/coursemology-theme).

## Sprockets Pipeline
Because we use Sass' `@import` directive, which does not ensure a file is included exactly once
(see sass/sass#139), we have a custom workaround by using an ERB template. This will properly
pick up changes made to scss files, but adding new files would require clearing the asset cache.

Run `rake assets:clobber` (in production) and `rm -rf tmp/cache` (in development) to clear the
cache.

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
