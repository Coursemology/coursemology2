# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'System: Administration: Instance: Courses', js: true do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:last_page) { Course.unscoped.page.total_pages }
    let!(:prefix) { "testadm-#{rand(36**12).to_s(36)}-crs-" }
    let!(:courses) do
      courses = create_list(:course, 2, prefix: prefix)
      create(:course_manager, course: courses.sample)
      create(:course_student, course: courses.sample)

      courses
    end

    # For certain tests, use the search box to only show the courses we created for this test.
    # This is to prevent tests failing if there are so many courses such that
    # the ones created for this test aren't on the first page.
    def search_for_courses(query)
      find(
        :xpath,
        # Find the courses table, go up to the parent, and select the input text field under that parent
        # (the Search text field)
        '//div[contains(@class, "MuiTableContainer-root")]/parent::*/descendant::input[@type="text"]'
      ).native.send_keys(query)
    end

    context 'As a Instance Administrator' do
      let(:admin) { create(:instance_administrator).user }
      before { login_as(admin, scope: :user) }

      scenario 'I can view all courses in the instance' do
        visit admin_instance_courses_path
        search_for_courses(prefix)

        courses.each do |course|
          within find("tr.course_#{course.id}", text: course.title) do
            expect(page).
              to have_link(nil, href: "//#{course.instance.host}/courses/#{course.id}")

            # It shows and only shows the owners
            course.course_users.owner.each do |course_user|
              expect(page).to have_selector('li', exact_text: course_user.user.name)
            end

            course.course_users.reject(&:owner?).each do |course_user|
              expect(page).not_to have_selector('li', exact_text: course_user.user.name)
            end
          end
        end
      end

      let!(:course_to_delete) { create(:course) }
      scenario 'I can delete a course' do
        visit admin_instance_courses_path
        search_for_courses(course_to_delete.title)

        find("button.course-delete-#{course_to_delete.id}").click
        expect(page).to have_button('Delete course', disabled: true)
        fill_in 'confirmDeleteField', with: 'coursemology'
        click_button('Delete course')
        expect_toastify("#{course_to_delete.title} was deleted.")
      end

      let!(:course_to_search) { create(:course, prefix: "testadm-search-#{rand(36**12).to_s(36)}-crs-") }
      scenario 'I can search courses' do
        visit admin_instance_courses_path
        search_for_courses(course_to_search.title)

        within find('div.MuiTableContainer-root') do
          expect(page).to have_text(course_to_search.title)
          expect(page.first('tbody')).to have_selector('tr', count: 1)
        end
      end
    end
  end
end
