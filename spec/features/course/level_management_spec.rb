require 'rails_helper'

RSpec.feature 'Course: Levels' do
  subject { page }

  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let!(:user) { create(:administrator) }
    let!(:course) { create(:course) }
    let!(:levels) do
      (1..3).map do |i|
        create(:course_level, course: course, experience_points_threshold: 100 * i)
      end
    end

    context 'As a Course Administrator,' do
      before do
        login_as(user, scope: :user)
        visit course_levels_path(course)
      end

      scenario 'I can view course levels' do
        (1..3).each do |i|
          expect(page.find('tr', text: i * 100)).to have_selector('td', text: i)
        end
      end

      scenario 'I can create a course level' do
        visit course_levels_path(course)
        find_link(nil, href: new_course_level_path(course)).click
        fill_in 'course_level_experience_points_threshold', with: 100

        expect do
          click_button I18n.t('helpers.submit.course_level.create')
        end.to change(course.levels, :count).by(1)
      end

      scenario 'I can delete a course level' do
        expect do
          find_link(nil, href: course_level_path(course, levels[0])).click
        end.to change(course.levels, :count).by(-1)
      end
    end
  end
end
