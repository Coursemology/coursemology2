require 'rails_helper'

RSpec.feature 'Course: Achievements' do
  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let!(:course) { create(:course) }
    let!(:draft_achievement) { create(:course_achievement, course: course, draft: true) }
    let!(:achievement) { create(:course_achievement, course: course) }
    let!(:achievements) { [achievement, draft_achievement] }

    before do
      login_as(user, scope: :user)
      visit course_achievements_path(course)
    end

    context 'As an Course Manager' do
      let(:user) { create(:course_manager, :approved, course: course).user }

      scenario 'I can view achievements' do
        expect(page).to have_link(nil, href: new_course_achievement_path(course))

        achievements.each do |achievement|
          expect(page).to have_content_tag_for(achievement)
          expect(page).to have_link(nil, href: edit_course_achievement_path(course, achievement))
          expect(page).to have_link(nil, href: course_achievement_path(course, achievement))
        end
      end
    end

    context 'As an Course Student' do
      let(:user) { create(:course_student, :approved, course: course).user }

      scenario 'I can view published achievements' do
        expect(page).not_to have_link(nil, href: new_course_achievement_path(course))

        expect(page).to have_content_tag_for(achievement)
        expect(page).not_to have_link(nil, href: edit_course_achievement_path(course, achievement))
        expect(page).not_to have_content_tag_for(draft_achievement)
      end
    end
  end
end
