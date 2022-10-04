# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Achievements', js: true do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }

    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }
      let(:other_achievement) { create(:course_achievement, course: course) }
      let!(:achievement_condition) do
        create(:achievement_condition, course: course, achievement: other_achievement,
                                       conditional: achievement)
      end
      let(:assessment) { create(:assessment, course: course) }
      let!(:assessment_condition) do
        create(:assessment_condition, course: course, assessment: assessment, conditional: achievement)
      end
      let!(:level_condition) { create(:level_condition, course: course, conditional: achievement) }
      let(:survey) { create(:survey, course: course) }
      let!(:survey_condition) do
        create(:survey_condition, course: course, survey: survey, conditional: achievement)
      end
      let!(:achievement) { create(:course_achievement, course: course) }

      # Achievement condition
      scenario 'I can create, edit, and delete an achievement condition' do
        valid_achievement_as_condition = create(:course_achievement, course: course)
        achievement_to_change_to = create(:course_achievement, course: course)
        visit edit_course_achievement_path(course, achievement)

        # Create achievement condition
        expect do
          click_button 'Add a condition'
          find('li', text: 'Achievement', exact_text: true).click
          find_field('Achievement').click
          find('li', text: valid_achievement_as_condition.title).click
          click_button 'Create condition'

          expect_toastify('Condition was successfully created.')
          expect(page).to have_selector('tr', text: valid_achievement_as_condition.title)
        end.to change { achievement.conditions.count }.by(1)

        # Edit achievement condition
        condition_row = find('tr', text: achievement_condition.title)
        edit_button = condition_row.first('button', visible: false)

        edit_button.click
        find_field('Achievement').click
        find('li', text: achievement_to_change_to.title).click
        click_button 'Update condition'

        expect_toastify('Your changes have been saved.')
        expect(page).to have_selector('tr', text: achievement_to_change_to.title)

        # Delete achievement condition
        achievement_condition.reload
        condition_row = find('tr', text: achievement_condition.title)
        delete_button = condition_row.all('button', visible: false).last

        expect do
          delete_button.click
          expect_toastify('Condition was successfully deleted.')
        end.to change { achievement.conditions.count }.by(-1)
      end

      scenario 'I can create, edit, and delete an assessment condition' do
        valid_assessment_as_condition = create(:assessment, course: course)
        assessment_to_change_to = create(:assessment, course: course)
        visit edit_course_achievement_path(course, achievement)

        # Create assessment condition
        expect do
          click_button 'Add a condition'
          find('li', text: 'Assessment', exact_text: true).click
          find_field('Assessment').click
          find('li', text: valid_assessment_as_condition.title).click
          click_button 'Create condition'

          expect_toastify('Condition was successfully created.')
        end.to change { achievement.conditions.count }.by(1)

        # Edit assessment condition
        condition_row = all('tr', text: 'Assessment').last
        edit_button = condition_row.first('button', visible: false)

        edit_button.click
        assessment_field = find_field('Assessment')
        expect(assessment_field.value).to eq(valid_assessment_as_condition.title)
        assessment_field.click
        find('li', text: assessment_to_change_to.title).click
        click_button 'Update condition'

        expect_toastify('Your changes have been saved.')
        condition_row.first('button', visible: false).click
        expect(find_field('Assessment').value).to eq(assessment_to_change_to.title)
        click_button 'Cancel'

        # Delete achievement condition
        delete_button = condition_row.all('button', visible: false).last

        expect do
          delete_button.click
          expect_toastify('Condition was successfully deleted.')
        end.to change { achievement.conditions.count }.by(-1)
      end

      scenario 'I can create, edit, and delete a level condition' do
        visit edit_course_achievement_path(course, achievement)
        minimum_level = '10'

        # Create level condition
        expect do
          click_button 'Add a condition'
          find('li', text: 'Level', exact_text: true).click
          fill_in 'minimumLevel', with: minimum_level
          click_button 'Create condition'

          expect_toastify('Condition was successfully created.')
        end.to change { achievement.conditions.count }.by(1)

        # Edit level condition
        new_minimum_level = '13'
        condition_row = all('tr', text: 'Level').last
        edit_button = condition_row.first('button', visible: false)

        edit_button.click
        expect(find_field('minimumLevel').value).to eq(minimum_level)
        fill_in 'minimumLevel', with: new_minimum_level
        click_button 'Update condition'

        expect_toastify('Your changes have been saved.')
        condition_row.first('button', visible: false).click
        expect(find_field('minimumLevel').value).to eq(new_minimum_level)
        click_button 'Cancel'

        # Delete level condition
        delete_button = condition_row.all('button', visible: false).last

        expect do
          delete_button.click
          expect_toastify('Condition was successfully deleted.')
        end.to change { achievement.conditions.count }.by(-1)
      end

      scenario 'I can create, edit, and delete a survey condition' do
        valid_survey_as_condition = create(:survey, course: course)
        survey_to_change_to = create(:survey, course: course)
        visit edit_course_achievement_path(course, achievement)

        # Create survey condition
        expect do
          click_button 'Add a condition'
          find('li', text: 'Survey', exact_text: true).click
          find_field('Survey').click
          find('li', text: valid_survey_as_condition.title).click
          click_button 'Create condition'

          expect_toastify('Condition was successfully created.')
        end.to change { achievement.conditions.count }.by(1)

        # Edit survey condition
        condition_row = all('tr', text: 'Survey').last
        edit_button = condition_row.first('button', visible: false)

        edit_button.click
        survey_field = find_field('Survey')
        expect(survey_field.value).to eq(valid_survey_as_condition.title)
        survey_field.click
        find('li', text: survey_to_change_to.title).click
        click_button 'Update condition'

        expect_toastify('Your changes have been saved.')
        condition_row.first('button', visible: false).click
        expect(find_field('Survey').value).to eq(survey_to_change_to.title)
        click_button 'Cancel'

        # Delete survey condition
        delete_button = condition_row.all('button', visible: false).last

        expect do
          delete_button.click
          expect_toastify('Condition was successfully deleted.')
        end.to change { achievement.conditions.count }.by(-1)
      end
    end
  end
end
