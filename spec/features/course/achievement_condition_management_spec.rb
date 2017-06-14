# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Achievements' do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }

    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }
      let(:other_achievement) { create(:course_achievement, course: course) }
      let(:achievement_condition) do
        create(:achievement_condition, course: course, achievement: other_achievement)
      end
      let(:assessment) { create(:assessment, course: course) }
      let(:assessment_condition) do
        create(:assessment_condition, course: course, assessment: assessment)
      end
      let(:level_condition) { create(:level_condition, course: course) }
      let!(:achievement) do
        create(:course_achievement,
               course: course,
               conditions: [achievement_condition, assessment_condition, level_condition])
      end

      # Achievement condition
      scenario 'I can create, edit and delete an achievement condition', js: true do
        valid_achievement_as_condition = create(:course_achievement, course: course)
        achievement_to_change_to = create(:course_achievement, course: course)

        visit edit_course_achievement_path(course, achievement)

        # Create achievement condition
        find('.add-condition-btn').click
        find_link(
          nil, href: new_course_achievement_condition_achievement_path(course, achievement)
        ).click

        expect(page).to have_text(I18n.t('course.condition.achievements.new.header'))
        find('#condition_achievement_achievement_id', visible: false).
          find(:css, "option[value='#{valid_achievement_as_condition.id}']", visible: false).
          select_option
        click_button I18n.t('helpers.submit.condition_achievement.create')
        expect(current_path).to eq edit_course_achievement_path(course, achievement)
        expect(page).
          to have_selector('.conditions-list', text: valid_achievement_as_condition.title)

        # Edit achievement condition
        find_link(
          nil, href: edit_course_achievement_condition_achievement_path(course, achievement,
                                                                        achievement_condition)
        ).click
        expect(page).to have_text(I18n.t('course.condition.achievements.edit.header'))
        find('#condition_achievement_achievement_id', visible: false).
          find(:css, "option[value='#{achievement_to_change_to.id}']", visible: false).
          select_option
        click_button I18n.t('helpers.submit.condition_achievement.update')
        expect(current_path).to eq edit_course_achievement_path(course, achievement)
        expect(page).to have_selector('.conditions-list', text: achievement_to_change_to.title)

        # Delete achievement condition
        expect do
          find_link(
            nil, href: course_achievement_condition_achievement_path(course, achievement,
                                                                     achievement_condition)
          ).click
          accept_confirm_dialog
        end.to change { achievement.conditions.count }.by(-1)
      end

      scenario 'I can create, edit and delete an assessment condition', js: true do
        valid_assessment_as_condition = create(:assessment, course: course)
        assessment_to_change_to = create(:assessment, course: course)

        visit edit_course_achievement_path(course, achievement)

        # Create assessment condition
        find('.add-condition-btn').click
        find_link(
          nil, href: new_course_achievement_condition_assessment_path(course, achievement)
        ).click

        expect(page).to have_text(I18n.t('course.condition.assessments.new.header'))
        find('#condition_assessment_assessment_id', visible: false).
          find(:css, "option[value='#{valid_assessment_as_condition.id}']", visible: false).
          select_option
        click_button I18n.t('helpers.submit.condition_assessment.create')
        expect(current_path).to eq edit_course_achievement_path(course, achievement)
        title = I18n.t('activerecord.attributes.course/condition/assessment/title.complete',
                       assessment_title: valid_assessment_as_condition.title)
        expect(page).to have_selector('.conditions-list', text: title)

        # Edit assessment condition
        find_link(
          nil, href: edit_course_achievement_condition_assessment_path(course, achievement,
                                                                       assessment_condition)
        ).click
        expect(page).to have_text(I18n.t('course.condition.assessments.edit.header'))
        find('#condition_assessment_assessment_id', visible: false).
          find(:css, "option[value='#{assessment_to_change_to.id}']", visible: false).
          select_option
        click_button I18n.t('helpers.submit.condition_assessment.update')
        expect(current_path).to eq edit_course_achievement_path(course, achievement)
        title = I18n.t('activerecord.attributes.course/condition/assessment/title.complete',
                       assessment_title: assessment_to_change_to.title)
        expect(page).to have_selector('.conditions-list', text: title)

        # Delete achievement condition
        expect do
          find_link(
            nil, href: course_achievement_condition_assessment_path(course, achievement,
                                                                    assessment_condition)
          ).click
          accept_confirm_dialog
        end.to change { achievement.conditions.count }.by(-1)
      end

      scenario 'I can create, edit and delete a level condition', js: true do
        visit edit_course_achievement_path(course, achievement)

        # Create level condition
        find('.add-condition-btn').click
        find_link(nil, href: new_course_achievement_condition_level_path(course, achievement)).click

        expect(page).to have_text(I18n.t('course.condition.levels.new.header'))
        fill_in 'minimum_level', with: '10'
        click_button I18n.t('helpers.submit.condition_level.create')
        expect(current_path).to eq edit_course_achievement_path(course, achievement)
        level_title = I18n.t('activerecord.attributes.course/condition/level/title.title',
                             value: 10)
        expect(page).to have_selector('.conditions-list', text: level_title)

        # Edit level condition
        find_link(
          nil, href: edit_course_achievement_condition_level_path(course, achievement,
                                                                  level_condition)
        ).click
        expect(page).to have_text(I18n.t('course.condition.levels.edit.header'))
        fill_in 'minimum_level', with: '13'
        click_button I18n.t('helpers.submit.condition_level.update')
        expect(current_path).to eq edit_course_achievement_path(course, achievement)
        level_title = I18n.t('activerecord.attributes.course/condition/level/title.title',
                             value: 13)
        expect(page).to have_selector('.conditions-list', text: level_title)

        # Delete level condition
        expect do
          find_link(
            nil, href: course_achievement_condition_level_path(course, achievement, level_condition)
          ).click
          accept_confirm_dialog
        end.to change { achievement.conditions.count }.by(-1)
      end
    end
  end
end
