# Testing with RSpec

This directory contains most of the tests responsible for ensuring that features in Coursemology behave as intended and regressions are prevented.

Our tests are written using the [RSpec](https://rspec.info/) framework for Ruby. For full-stack integration tests that simulate user behavior through the React frontend, we use [Capybara](https://github.com/teamcapybara/capybara). 

## Running the Tests

First, make sure the test database is seeded before running any specs:

```bash
RAILS_ENV=test bundle exec rake db:setup
```

Then, make sure the [authentication server](../authentication/README.md) is running.

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
