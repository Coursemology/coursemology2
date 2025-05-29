# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Achievements', js: true do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }

    before do
      login_as(user, scope: :user)
    end

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }

      scenario 'I can create and edit an achievement' do
        visit course_achievements_path(course)

        # Open new achievement modal and fill up fields.
        find('button.new-achievement-button').click
        expect(page).to have_selector('h2', text: 'New Achievement')
        achievement = attributes_for(:course_achievement, course: course)
        fill_in 'title', with: achievement[:title]

        # Create the achievement
        expect do
          find('button.btn-submit').click
          expect(page).not_to have_selector('h2', text: 'New Achievement')
        end.to change { course.achievements.count }.by(1)
        achievement_created = course.achievements.last
        expect(page).to have_text(achievement[:title])
        expect(page).to have_current_path(course_achievement_path(course, achievement_created))

        # Edit the achivement
        find("button.achievement-edit-#{achievement_created.id}").click
        expect(page).to have_selector('h2', text: 'Edit Achievement')
        new_achievement = attributes_for(:course_achievement, course: course)
        fill_in 'title', with: new_achievement[:title]

        # Edit the achievement
        find('.btn-submit').click
        expect(page).to have_selector('h2', text: 'Edit Achievement')
        expect(page).to have_current_path(course_achievement_path(course, achievement_created))
        expect(page).to have_text(new_achievement[:title])
      end

      scenario 'I can delete an achievement' do
        achievement = create(:course_achievement, course: course)
        visit course_achievements_path(course)

        expect do
          find("button.achievement-delete-#{achievement.id}").click
          accept_prompt
        end.to change { course.achievements.count }.by(-1)
      end

      scenario 'I can award a manually-awarded achievement to a student' do
        manual_achievement = create(:course_achievement, course: course)
        auto_achievement = create(:course_achievement, course: course)
        create(:course_condition_achievement, course: course, conditional: auto_achievement)

        student = create(:course_student, course: course)
        phantom_user = create(:course_student, :phantom, course: course)

        visit course_achievements_path(course)
        expect(page).to have_selector("button.achievement-award-#{auto_achievement.id}")
        expect(page).to have_selector("button.achievement-award-#{manual_achievement.id}")

        find("button.achievement-award-#{manual_achievement.id}").click

        normal_user_checkbox = page.find("#checkbox_#{student.id}", visible: false)
        phantom_user_checkbox = page.find("#checkbox_#{phantom_user.id}", visible: false)

        expect(normal_user_checkbox.checked?).to be_falsey
        expect(phantom_user_checkbox.checked?).to be_falsey

        normal_user_checkbox.check
        phantom_user_checkbox.check

        expect do
          find_button('Save Changes').click
          accept_confirm_dialog
        end.to change(manual_achievement.course_users, :count).by(2)
      end
    end
  end
end
