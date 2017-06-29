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

      scenario 'I can create and edit an achievement', js: true do
        visit course_achievements_path(course)

        # Open new achievement modal and fill up fields.
        find('div.new-btn button').click
        expect(page).to have_selector('h3', text: 'New Achievement')
        achievement = attributes_for(:course_achievement, course: course)
        fill_in 'title', with: achievement[:title]

        # Create the achievement
        expect do
          find('button.btn-submit').click
          expect(page).not_to have_selector('h3', text: 'New Achievement')
        end.to change { course.achievements.count }.by(1)
        achievement_created = course.achievements.last
        expect(page).to have_text(achievement[:title])
        expect(current_path).to eq(course_achievement_path(course, achievement_created))

        # Edit the achivement
        visit edit_course_achievement_path(course, achievement_created)
        expect(page).
          to have_selector('h1', text: I18n.t('course.achievement.achievements.edit.header'))
        new_achievement = attributes_for(:course_achievement, course: course)
        fill_in 'title', with: new_achievement[:title]

        # Edit the achievement
        find('.btn-submit').click
        expect(page).
          not_to have_selector('h1', text: I18n.t('course.achievement.achievements.edit.header'))
        expect(current_path).to eq(course_achievements_path(course))
        expect(page).to have_text(new_achievement[:title])
      end

      scenario 'I can delete an achievement' do
        achievement = create(:course_achievement, course: course)
        visit course_achievements_path(course)

        within find(content_tag_selector(achievement)) do
          # first is used because a duplicate set of buttons are used for mobile view.
          expect { first(:css, 'a.delete').click }.to change { course.achievements.count }.by(-1)
        end
        expect(page).to have_selector('div', text: I18n.t('course.achievement.achievements.'\
                                                          'destroy.success'))
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
