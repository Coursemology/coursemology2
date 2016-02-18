# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Achievements' do
  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let!(:course) { create(:course) }
    let!(:draft_achievement) { create(:course_achievement, course: course, draft: true) }
    let!(:achievement1) { create(:course_achievement, course: course) }
    let!(:achievement2) { create(:course_achievement, course: course) }
    let!(:achievements) { [achievement1, achievement2, draft_achievement] }

    before do
      login_as(user, scope: :user)
      visit course_achievements_path(course)
    end

    context 'As an Course Manager' do
      let(:user) { create(:course_manager, :approved, course: course).user }

      scenario 'I can view all achievements' do
        expect(page).to have_link(nil, href: new_course_achievement_path(course))

        achievements.each do |achievement|
          expect(page).to have_content_tag_for(achievement)
          expect(page).to have_link(nil, href: edit_course_achievement_path(course, achievement))
          expect(page).to have_link(nil, href: course_achievement_path(course, achievement))
        end
      end
    end

    context 'As an Course Student' do
      let!(:course_student) { create(:course_student, :approved, course: course) }
      let!(:user) { course_student.user }
      before do
        create(:course_user_achievement, course_user: course_student, achievement: achievement1)
      end

      scenario 'I can view all published achievements and whether I have obtained them' do
        visit course_achievements_path(course)
        expect(page).not_to have_link(nil, href: new_course_achievement_path(course))
        expect(page).not_to have_content_tag_for(draft_achievement)

        expect(page).not_to have_link(nil, href: edit_course_achievement_path(course, achievement1))
        expect(page).not_to have_link(nil, href: edit_course_achievement_path(course, achievement2))

        expect(page).to have_content_tag_for(achievement1)
        expect(page).to have_content_tag_for(achievement2)
        # Achievement obtained by course_user
        expect(page).to have_tag('tr.achievement.granted', count: 1)
        # Achievement not yet obtained by course_user
        expect(page).to have_tag('tr.achievement.locked', count: 1)
      end

      scenario 'I can view the Achievement Sidebar item' do
        visit course_path(course)

        expect(page).to have_selector('li', text: 'course.achievements.sidebar_title')
      end
    end
  end
end
