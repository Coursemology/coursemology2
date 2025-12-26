# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Achievements', js: true do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let!(:course) { create(:course) }
    let!(:draft_achievement) { create(:course_achievement, course: course, published: false) }
    let!(:achievement1) { create(:course_achievement, course: course) }
    let!(:achievement2) { create(:course_achievement, course: course) }
    let!(:achievements) { [achievement1, achievement2, draft_achievement] }

    before do
      login_as(user, scope: :user)
      visit course_achievements_path(course)
    end

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }

      scenario 'I can view all achievements' do
        achievements.each do |achievement|
          expect(page).to have_selector("button.achievement-award-#{achievement.id}")
          expect(page).to have_selector("button.achievement-edit-#{achievement.id}")
          expect(page).to have_selector("button.achievement-delete-#{achievement.id}")
          expect(page).to have_link(nil, href: course_achievement_path(course, achievement))
        end
      end
    end

    context 'As a Course Student' do
      let!(:course_student1) { create(:course_student, course: course) }
      let!(:course_student2) { create(:course_student, course: course) }
      let!(:phantom_user) { create(:course_student, :phantom, course: course) }
      let!(:user) { course_student1.user }
      before do
        create(:course_user_achievement, course_user: course_student1, achievement: achievement1)
        create(:course_user_achievement, course_user: course_student1, achievement: achievement2)
        create(:course_user_achievement, course_user: course_student2, achievement: achievement2)
      end

      scenario 'I can view all published achievements and whether I have obtained them' do
        visit course_achievements_path(course)

        # Ensure no 'New' button for achievement creation
        expect(page).not_to have_selector('.button.new-achievement-button')
        expect(page).not_to have_link(nil, href: course_achievement_path(course, draft_achievement))

        expect(page).not_to have_selector("button.achievement-award-#{achievement1.id}")
        expect(page).not_to have_selector("button.achievement-edit-#{achievement1.id}")
        expect(page).not_to have_selector("button.achievement-delete-#{achievement1.id}")

        expect(page).not_to have_selector("button.achievement-award-#{achievement2.id}")
        expect(page).not_to have_selector("button.achievement-edit-#{achievement2.id}")
        expect(page).not_to have_selector("button.achievement-delete-#{achievement2.id}")

        expect(page).to have_link(nil, href: course_achievement_path(course, achievement1))
        expect(page).to have_link(nil, href: course_achievement_path(course, achievement2))
      end

      scenario 'I can view the Achievement Sidebar item' do
        visit course_path(course)

        expect(find_sidebar).to have_selector('#sidebar_item_achievements')
      end

      scenario 'I can view all users who have obtained an achievement' do
        [achievement2].each do |achievement|
          visit course_achievement_path(course, achievement)

          obtained = achievement.course_users
          not_obtained = course.course_users - obtained

          obtained.each { |course_user| expect(page).to have_link(nil, href: course_user_path(course, course_user)) }
          not_obtained.each do |course_user|
            expect(page).not_to have_link(nil, href: course_user_path(course, course_user))
          end

          expect(page).not_to have_link(nil, href: course_user_path(course, phantom_user))
        end
      end
    end
  end
end
