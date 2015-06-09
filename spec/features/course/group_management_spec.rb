require 'rails_helper'

RSpec.feature 'Courses: Groups' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:user) { create(:administrator) }
    let!(:groups) { create_list(:course_group, 3, course: course) }
    before { login_as(user, scope: :user) }

    scenario 'Course staff can view all the groups in course' do
      visit course_groups_path(course)

      expect(page).to have_link(I18n.t('course.groups.index.new'),
                                href: new_course_group_path(course))

      groups.each do |group|
        expect(page).to have_selector('td', text: group.name)
        expect(page).to have_link(nil, href: edit_course_group_path(course, group))
        expect(page).to have_link(nil, href: course_group_path(course, group))
      end
    end
  end
end
