# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Achievements' do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }

    before do
      login_as(user, scope: :user)
    end

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }

      scenario 'I can create an achievement' do
        # To be updated when react is written in.
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
        visit course_achievements_path(course)

        within find(content_tag_selector(achievement)) do
          # first is used because a duplicate set of buttons are used for mobile view.
          expect { first(:css, 'a.delete').click }.to change { course.achievements.count }.by(-1)
        end
        expect(page).to have_selector('div', text: I18n.t('course.achievement.achievements.'\
                                                          'destroy.success'))
      end

      scenario 'I can edit an achievement' do
        # To be updated when react is written in.
        pending
        achievement = create(:course_achievement, course: course)
        visit edit_course_achievement_path(course, achievement)
        expect(page).to have_field('achievement_title', with: achievement.title)
        expect(page).to have_field('achievement_description', with: achievement.description)
        expect(page).to have_checked_field('achievement_published')

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
        expect(page).to have_selector('div', text: I18n.t('course.achievement.achievements.update.'\
                                                          'success'))
        expect(page).to have_content(achievement.badge.medium.url)
        expect(achievement.reload.title).to eq(new_title)
        expect(achievement.reload.description).to eq(new_description)
      end

      scenario 'I can award a manually-awarded achievement to a student' do
        manual_achievement = create(:course_achievement, course: course)
        auto_achievement = create(:course_achievement, course: course)
        create(:course_condition_achievement, course: course, conditional: auto_achievement)

        student = create(:course_student, course: course)
        course_user_id = "achievement_course_user_ids_#{student.id}"
        phantom_user = create(:course_student, :phantom, course: course)
        phantom_user_id = "achievement_course_user_ids_#{phantom_user.id}"

        visit course_achievements_path(course)

        expect(page).to have_content_tag_for(auto_achievement)
        expect(page).
          not_to have_link(nil,
                           href: course_achievement_course_users_path(course, auto_achievement))

        within find(content_tag_selector(manual_achievement)) do
          # first is used because a duplicate set of buttons are used for mobile view.
          first(:link, href: course_achievement_course_users_path(course, manual_achievement)).click
        end

        expect(page).to have_unchecked_field(course_user_id)
        expect(page).to have_unchecked_field(phantom_user_id)
        check course_user_id
        check phantom_user_id

        expect do
          click_button I18n.t('course.achievement.course_users.course_users_form.button')
        end.to change(manual_achievement.course_users, :count).by(2)
      end
    end
  end
end
