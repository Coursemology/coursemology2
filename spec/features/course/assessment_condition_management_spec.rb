require 'rails_helper'

RSpec.feature 'Course: Assessments' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, :approved, course: course).user }
      let!(:assessment) { create(:course_assessment_assessment, course: course) }
      let(:achievement) { create(:course_achievement, course: course) }
      let!(:achievement_condition) do
        create(:achievement_condition,
               course: course, achievement: achievement, conditional: assessment)
      end
      let(:other_assessment) { create(:assessment, course: course) }
      let!(:assessment_condition) do
        create(:assessment_condition,
               course: course, assessment: other_assessment, conditional: assessment)
      end
      let!(:level_condition) { create(:level_condition, course: course, conditional: assessment) }

      # Achievement condition

      scenario 'I can create an achievement condition' do
        valid_achievement_as_condition = create(:course_achievement, course: course)

        visit edit_course_assessment_path(course, assessment)
        click_link Course::Condition::Achievement.model_name.human
        expect(page).to have_selector('#condition_achievement_achievement_id >' \
          "option[value='#{valid_achievement_as_condition.id}']")

        # Selecting nothing won't work
        click_button I18n.t('helpers.submit.condition_achievement.create')
        expect(current_path).
          to eq(course_assessment_condition_achievements_path(course, assessment))
        expect(page).to have_text(I18n.t('errors.messages.blank'))

        # Select the right option
        find('#condition_achievement_achievement_id').
          find(:css, "option[value='#{valid_achievement_as_condition.id}']").
          select_option
        click_button I18n.t('helpers.submit.condition_achievement.create')
        expect(current_path).to eq edit_course_assessment_path(course, assessment)
        expect(page).to have_selector('tr.condition > td.achievement-condition-content',
                                      text: valid_achievement_as_condition.title)
      end

      scenario 'I can edit an achievement condition' do
        achievement_to_change_to = create(:course_achievement, course: course)
        visit edit_course_assessment_path(course, assessment)
        expect(current_path).to eq edit_course_assessment_path(course, assessment)
        expect(page).to have_selector('tr.condition > td.achievement-condition-content',
                                      text: achievement.title)
        condition_edit_path =
          edit_course_assessment_condition_achievement_path(course, assessment,
                                                            achievement_condition)
        find_link(nil, href: condition_edit_path).click

        find('#condition_achievement_achievement_id').
          find(:css, "option[value='#{achievement_to_change_to.id}']").
          select_option
        click_button I18n.t('helpers.submit.condition_achievement.update')
        expect(current_path).to eq edit_course_assessment_path(course, assessment)
        expect(page).to have_selector('tr.condition > td.achievement-condition-content',
                                      text: achievement_to_change_to.title)
      end

      scenario 'I can delete an achievement condition' do
        visit edit_course_assessment_path(course, assessment)
        condition_delete_path =
          course_assessment_condition_achievement_path(course, assessment, achievement_condition)
        expect do
          find_link(nil, href: condition_delete_path).click
        end.to change { assessment.conditions.count }.by(-1)
        expect(page).not_to have_selector('tr.condition > td.achievement-condition-content',
                                          text: achievement.title)
      end

      # Assessment condition

      scenario 'I can create a assessment condition' do
        valid_assessment_as_condition = create(:assessment, course: course)

        visit edit_course_assessment_path(course, assessment)
        click_link Course::Condition::Assessment.model_name.human
        expect(current_path).
          to eq(new_course_assessment_condition_assessment_path(course, assessment))

        find('#condition_assessment_assessment_id').
          find(:css, "option[value='#{valid_assessment_as_condition.id}']").
          select_option
        click_button I18n.t('helpers.submit.condition_assessment.create')
        expect(current_path).to eq edit_course_assessment_path(course, assessment)
        expect(page).to have_selector('tr.condition > td.assessment-condition-content',
                                      text: valid_assessment_as_condition.title)
      end

      scenario 'I can edit a assessment condition' do
        assessment_to_change_to  = create(:assessment, course: course)

        visit edit_course_assessment_path(course, assessment)
        expect(current_path).to eq edit_course_assessment_path(course, assessment)
        expect(page).to have_selector('tr.condition > td.assessment-condition-content',
                                      text: other_assessment.title)
        condition_edit_path =
          edit_course_assessment_condition_assessment_path(course, assessment,
                                                           assessment_condition)
        find_link(nil, href: condition_edit_path).click
        find('#condition_assessment_assessment_id').
          find(:css, "option[value='#{assessment_to_change_to.id}']").
          select_option
        click_button I18n.t('helpers.submit.condition_assessment.update')
        expect(current_path).to eq edit_course_assessment_path(course, assessment)
        expect(page).to have_selector('tr.condition > td.assessment-condition-content',
                                      text: assessment_to_change_to.title)
      end

      scenario 'I can delete a assessment condition' do
        visit edit_course_assessment_path(course, assessment)
        condition_delete_path =
          course_assessment_condition_assessment_path(course, assessment, assessment_condition)
        expect do
          find_link(nil, href: condition_delete_path).click
        end.to change { assessment.conditions.count }.by(-1)
        expect(page).not_to have_selector('tr.condition > td.assessment-condition-content',
                                          text: other_assessment.title)
      end

      # Level condition

      scenario 'I can create a level condition' do
        visit edit_course_assessment_path(course, assessment)
        click_link Course::Condition::Level.model_name.human
        expect(current_path).to eq(new_course_assessment_condition_level_path(course, assessment))
        fill_in 'minimum_level', with: '10'
        click_button I18n.t('helpers.submit.condition_level.create')
        expect(current_path).to eq edit_course_assessment_path(course, assessment)
        level_title = I18n.t('activerecord.attributes.course/condition/level/title.title',
                             value: 10)
        expect(page).to have_selector('tr.condition > td.level-condition-content',
                                      text: level_title)
      end

      scenario 'I can edit a level condition' do
        visit edit_course_assessment_path(course, assessment)
        expect(current_path).to eq edit_course_assessment_path(course, assessment)
        level_title = I18n.t('activerecord.attributes.course/condition/level/title.title',
                             value: 1)
        expect(page).to have_selector('tr.condition > td.level-condition-content',
                                      text: level_title)
        condition_edit_path = edit_course_assessment_condition_level_path(course,
                                                                          assessment,
                                                                          level_condition)
        find_link(nil, href: condition_edit_path).click
        fill_in 'minimum_level', with: '13'
        click_button I18n.t('helpers.submit.condition_level.update')
        expect(current_path).to eq edit_course_assessment_path(course, assessment)
        level_title = I18n.t('activerecord.attributes.course/condition/level/title.title',
                             value: 13)
        expect(page).to have_selector('tr.condition > td.level-condition-content',
                                      text: level_title)
      end

      scenario 'I can delete a level condition' do
        visit edit_course_assessment_path(course, assessment)
        condition_delete_path = course_assessment_condition_level_path(course,
                                                                       assessment,
                                                                       level_condition)
        expect do
          find_link(nil, href: condition_delete_path).click
        end.to change { assessment.conditions.count }.by(-1)
        level_title = I18n.t('activerecord.attributes.course/condition/level/title.title',
                             value: 1)
        expect(page).not_to have_selector('tr.condition > td.level-condition-content',
                                          text: level_title)
      end
    end
  end
end
