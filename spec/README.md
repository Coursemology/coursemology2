# Testing with RSpec

This directory contains most of the tests responsible for ensuring that features in Coursemology behave as intended and regressions are prevented.

Our tests are written using the [RSpec](https://rspec.info/) framework for Ruby. For full-stack integration tests that simulate user behavior through the React frontend, we use [Capybara](https://github.com/teamcapybara/capybara). 

## Running the Tests

First, make sure the test database is seeded before running any specs:

```bash
RAILS_ENV=test bundle exec rake db:setup
```

Then, make sure the [authentication server](../authentication/README.md) is running. This is required for *any* feature spec, not just ones that exercise sign-in: our `login_as` helper is not Warden's — it drives the real Keycloak sign-in page and waits for the user menu to appear. If Keycloak is not up, every feature spec fails early on `visit new_user_session_path` with a `Selenium::WebDriver::Error::WebDriverError`, which looks like a browser problem rather than a missing service.

Note that `docker compose up` in `authentication/` may try to pull `coursemology_auth` from a registry and fail, because the compose file names the image without a build context. If you have already built the image locally, start it with `docker compose up -d --pull never`.

You can then run tests with:

```bash
RAILS_ENV=test bundle exec rspec path/to/spec.rb
```

For feature specs that require interaction with the React frontend, follow these steps *before* starting the RSpec test run:

1. Install Google Chrome or Chromium.
2. Create `.env.test` in the `client` directory, by copying `env.test` in that same directory.
3. Run `yarn build:test` from the `client` directory to build frontend assets.
4. Download or build the [dirt-cheap-rocket server script from its Github repository](https://github.com/coursemology/dirt-cheap-rocket)
5. In a separate terminal, start the server from *the root directory* with

```bash
DCR_CLIENT_PORT=3200 DCR_SERVER_PORT=7979 DCR_PUBLIC_PATH='/static' DCR_ASSETS_DIR='./client/build' node path/to/dirt-cheap-rocket.cjs
```

## Testing Pitfalls to Avoid

### Fixed Sleeps and Non-Asynchronous Assertions

**Fixed sleeps are inherently flaky** and we should phase them out whenever possible.

#### Example (Old)
```ruby
scenario 'I can search courses' do
  skip 'Flaky tests'
  visit admin_instance_courses_path

  find_button('Search').click
  find('div[aria-label="Search"]').find('input').set(course_to_search.title)

  wait_for_field_debouncing # timeout for search debouncing

  expect(page).to have_selector('p.course_title', text: course_to_search.title)
  expect(all('.course').count).to eq(1) # flaky check
end
```

`wait_for_field_debouncing` is a fixed sleep that waits for a set amount of time. This test then assumes the page has fully updated before the assertion, which may not always be correct. If the assertion is performed before the page has actually updated, the test will fail.

#### Example (Updated)

```ruby
scenario 'I can search courses' do
  visit admin_instance_courses_path
  search_for_courses(course_to_search.title)

  within find('div.MuiTableContainer-root') do
    expect(page).to have_text(course_to_search.title)
    expect(page.first('tbody')).to have_selector('tr', count: 1) # more reliable check
  end
end
```

This test now uses the waiting functionality built into Capybara's `have_*` method. As long as the page satisfies the condition at some point before the timeout, the test will pass.

### Records in Paginated Tables

It is important to note that *tests do not clean up database records after the scenario ends.* This can cause issues for tests that check for specific records within a table.

#### Example
```ruby
let!(:courses) do
  courses = create_list(:course, 2)
  ...
end

context 'As a Instance Administrator' do
  let(:admin) { create(:instance_administrator).user }
  before { login_as(admin, scope: :user) }

  scenario 'I can view all courses in the instance' do
    visit admin_instance_courses_path

    courses.each do |course|
      expect(page).to have_selector("tr.course_#{course.id}", text: course.title)
      ...
```

This test can fail if the `courses` table contains too many records from previous runs, such that the ones generated in this run (which the test suite asserts for) are pushed to page 2 of the table, and therefore fail the test because they were not found on page 1.

To prevent this issue, we recommend creating a records with a unique prefix for the current run, and filtering the table to only display records matching that prefix.

The same accumulation makes it unsafe to *select* the records under test by querying the database. A scenario that picks, say, `User.human_users.normal.ordered_by_name.limit(3)` or `Instance.order_for_display[1]` gets whatever earlier runs happened to leave behind, not the records it created. Create the records the scenario needs, then assert against those.

How to filter the table depends on which table component the page uses:

```ruby
# mui-datatables (e.g. the system admin users table): the field is behind a button
find_button('Search').click
find('div[aria-label="Search"]').find('input').set(prefix)
wait_for_field_debouncing # this search round-trips to the server

# lib/components/table (e.g. the instances and admin courses tables): the field is always
# visible, found by its placeholder, and filters client-side
find_field('Search instance by name or host').set(prefix)
```

### Asserting on Record Identity Rather Than Displayed Text

Names and emails are not unique in the test database — factory sequences restart, so hundreds of leftover users share names like `user 1`, across different roles. An assertion such as "no *normal* user named `user 1` is visible" then fails as soon as an unrelated *administrator* with that name is legitimately on screen.

Prefer the row's id-bearing class, and scope any text assertions inside it:

```ruby
expect(page).to have_selector("tr.system_user_#{admin_user.id}")
expect(page).to have_no_selector("tr.system_user_#{normal_user.id}")

within find("tr.system_user_#{admin_user.id}") do
  expect(page).to have_selector('div.user_name', exact_text: admin_user.name)
end
```

### `exact_text` With a Nil Value Silently Matches Everything

Capybara drops the filter when `exact_text` is `nil` instead of raising, so the assertion quietly stops asserting what it was written to assert:

```ruby
# if user.email is nil, this becomes "no p.user_email may be visible at all"
expect(page).to have_no_selector('p.user_email', exact_text: user.email)
```

It is easy to miss because such an assertion usually *passes* — vacuously. The tell in a failure message is a missing `with exact text ...` clause. `User#email` is a real source of `nil` here: it returns the **primary** address via `devise-multi_email`, and the user factory leaves no primary address when built with `emails_count: 0`. Assert on a value the scenario controls, or on record identity as above.

### Server-Rendered Copy Is Not Translated in the Test Environment

Rails `I18n` is stubbed to return the translation key, so a server-rendered view yields `common.mailers.greeting`, not the English string, and interpolation never happens. Asserting on translated server-side copy therefore tests nothing. Interpolation arguments are still *evaluated*, so a missing method on an object passed to `t` still raises — which is often the only coverage such a view has.

The React frontend is unaffected: it renders real English, which is why feature specs can match on visible UI text and placeholders.

### Toasts Auto-Dismiss, So Assert Them First

`expect_toastify` must come before any negative assertion about the effect it reports. Capybara's negative matchers wait out the full timeout before passing, so putting one first burns the whole window and the toast is gone by the time it is looked for — surfacing as a confusing "Unable to find visible css `.Toastify`" rather than the real failure:

```ruby
click_button('Delete')
expect_toastify("#{instance.name} was deleted.")            # first
expect(page).not_to have_selector("div.instance_name_field_#{instance.id}") # then
```

## Known Issues

### Handling Page Animations

Some UI components (e.g., dropdowns, modals) use animations that can interfere with Capybara's element targeting.

#### Example
```ruby
scenario 'I can create a new text response question' do
  visit course_assessment_path(course, assessment)
  click_on 'New Question'
  new_page = window_opened_by { click_link 'Text Response' }

  within_window new_page do
    ...
```

This test opens the `/courses/{id}/assessments/{id}` page and clicks the "New Question" button. Then, a menu containing various options ("Text Response", "Audio Response", "Programming", etc), and our intent is to click on a specific one ("Text Response"). However, Capybara does this by recording the coordinates of the element containing "Text Response", and then triggers a click event on those coordinates.

The "New Question" menu is *animated* to first display a scaled-down version that gradually grows larger until it reaches full size. If the coordinates are recorded *while the scaling animation is still in progress*, the coordinates may be over the wrong element in the full-size menu that is actually clicked, causing the test to break because it clicked on the wrong element.

Unfortunately, we currently do not have a better solution for this than adding a short sleep to account for animations that may influence the test run like this, even though it contradicts the earlier point on fixed sleeps.
