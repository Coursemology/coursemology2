require 'rails_helper'

RSpec.feature 'Course: Achievements' do
  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let!(:user) { create(:administrator) }
    let!(:course) { create(:course) }
    let!(:achievements) do
      create_list(:course_achievement, 10, course: course)
    end

    before do
      login_as(user, scope: :user)
      visit course_achievements_path(course)
    end

    context 'As an Administrator' do
      scenario 'I can create achievements' do
        expect(page).to have_link(nil, href: new_course_achievement_path(course))
      end

      scenario 'I can view achievements' do
        achievements.each do |achievement|
          expect(page).to have_content_tag_for(achievement)
        end
      end

      scenario 'I can manage achievements' do
        achievements.each do |achievement|
          expect(page).to have_link(nil, href: edit_course_achievement_path(course, achievement))
          expect(page).to have_link(nil, href: course_achievement_path(course, achievement))
        end
      end
    end
  end
end
