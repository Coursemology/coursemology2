require 'rails_helper'

RSpec.feature 'System: Administration: Courses' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let!(:courses) do
      courses = create_list(:course, 2)
      other_instance = create(:instance)
      courses.last.update_column(:instance_id, other_instance)
      Course.unscoped.ordered_by_title.page(1)
    end

    context 'As a System Administrator' do
      let(:admin) { create(:administrator) }
      before { login_as(admin, scope: :user) }

      scenario 'I can view all courses in the system' do
        visit admin_courses_path

        courses.each do |course|
          expect(page).to have_selector('tr.course th', text: course.title)
          expect(page).
            to have_link(nil, href: course_url(course, host: course.instance.host, port: nil))
        end
      end

      let!(:course_to_delete) { create(:course, title: courses.first.title) }
      scenario 'I can delete a course' do
        visit admin_courses_path

        find_link(nil, href: admin_course_path(course_to_delete)).click
        expect(page).to have_selector('div', text: I18n.t('system.admin.courses.destroy.success'))
      end
    end
  end
end
