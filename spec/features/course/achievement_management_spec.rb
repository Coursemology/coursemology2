# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Achievements' do
  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }

    before do
      login_as(user, scope: :user)
    end

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, :approved, course: course).user }

      scenario 'I can create an achievement' do
        # Fields not yet filled
        visit new_course_achievement_path(course)
        click_button I18n.t('helpers.submit.achievement.create')
        expect(page).to have_button(I18n.t('helpers.submit.achievement.create'))
        expect(page).to have_css('div.has-error')

        achievement = build(:course_achievement, course: course)
        fill_in 'achievement_title', with: achievement.title
        fill_in 'achievement_description', with: achievement.description
        attach_file :achievement_badge, File.join(Rails.root, '/spec/fixtures/files/picture.jpg')
        expect do
          click_button I18n.t('helpers.submit.achievement.create')
        end.to change(course.achievements, :count).by(1)
        expect(page).to have_selector('div', text: I18n.t('course.achievement.achievements.create.'\
                                                          'success'))
        expect(current_path).to eq(course_achievements_path(course))
        expect(page).to have_content(achievement.badge.medium.url)
      end

      scenario 'I can delete an achievement' do
        visit new_course_achievement_path(course)
        achievement = create(:course_achievement, course: course)
        achievement_path = course_achievement_path(course, achievement)
        visit course_achievements_path(course)
        expect do
          # Show and delete have the same URL, difference is in the request method
          # find the 2nd link that matches the path [2], this is the delete button
          find_link(nil, href: achievement_path, between: 2..2).click
        end.to change(course.achievements, :count).by(-1)
        expect(page).to have_selector('div', text: I18n.t('course.achievement.achievements.'\
                                                          'destroy.success'))
      end

      scenario 'I can edit an achievement' do
        achievement = create(:course_achievement, course: course)
        visit edit_course_achievement_path(course, achievement)
        expect(page).to have_field('achievement_title', with: achievement.title)
        expect(page).to have_field('achievement_description', with: achievement.description)
        expect(page).to have_unchecked_field('achievement_draft')

        # Invalid fields
        fill_in 'achievement_title', with: ''
        click_button I18n.t('helpers.submit.achievement.update')
        expect(page).to have_button(I18n.t('helpers.submit.achievement.update'))
        expect(page).to have_css('div.has-error')

        new_title = 'New Title'
        new_description = 'New description'
        fill_in 'achievement_title', with: new_title
        fill_in 'achievement_description', with: new_description
        attach_file :achievement_badge, File.join(Rails.root, '/spec/fixtures/files/picture.jpg')
        click_button I18n.t('helpers.submit.achievement.update')
        expect(current_path).to eq course_achievements_path(course)
        expect(page).to have_selector('div', I18n.t('course.achievement.achievements.update.'\
                                                    'success'))
        expect(page).to have_content(achievement.badge.medium.url)
        expect(achievement.reload.title).to eq(new_title)
        expect(achievement.reload.description).to eq(new_description)
      end

      scenario 'I can award an achievement to a student' do
        achievement = create(:course_achievement, course: course)
        student = create(:course_student, course: course)
        course_user_id = "achievement_course_user_ids_#{student.id}"

        visit course_achievement_course_users_path(course, achievement)
        expect(page).to have_unchecked_field(course_user_id)
        check course_user_id

        expect do
          click_button I18n.t('course.achievement.course_users.course_users_form.button')
        end.to change(achievement.course_users, :count).by(1)
      end
    end
  end
end
