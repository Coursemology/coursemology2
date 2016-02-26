# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'System: Administration: Courses' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:last_page) { Course.unscoped.page.total_pages }
    let!(:courses) do
      courses = create_list(:course, 2)
      other_instance = create(:instance)
      courses.last.update_column(:instance_id, other_instance)
      Course.unscoped.ordered_by_title.page(last_page)
    end

    context 'As a System Administrator' do
      let(:admin) { create(:administrator) }
      before { login_as(admin, scope: :user) }

      scenario 'I can view all courses in the system' do
        visit admin_courses_path(page: last_page)

        courses.each do |course|
          expect(page).to have_selector('tr.course th', text: course.title)
          expect(page).
            to have_link(nil, href: course_url(course, host: course.instance.host, port: nil))
        end
      end

      scenario 'I can delete a course' do
        course_to_delete = create(:course, title: Course.unscoped.ordered_by_title.first.title)
        visit admin_courses_path

        find_link(nil, href: admin_course_path(course_to_delete)).click
        expect(page).to have_selector('div', text: I18n.t('system.admin.courses.destroy.success'))
      end

      scenario 'I can search courses' do
        course_to_search = create(:course)

        visit admin_courses_path
        fill_in 'search', with: course_to_search.title
        click_button I18n.t('layouts.search_form.search_button')

        expect(page).to have_content_tag_for(course_to_search)
        expect(all('.course').count).to eq(1)
      end
    end
  end
end
