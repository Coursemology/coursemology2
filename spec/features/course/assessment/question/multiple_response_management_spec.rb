# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Assessments: Questions: Multiple Response Management', js: true do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, course: course) }
    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }

      # Flaky test
      xscenario 'I can switch MCQ to MRQ, and back to MCQ, for a new question' do
        visit course_assessment_path(course, assessment)
        wait_for_page
        click_on 'New Question'
        new_mcq_page = window_opened_by { click_link 'Multiple Choice (MCQ)' }

        within_window new_mcq_page do
          wait_for_page
          expect(page).to have_text(
            I18n.t('course.assessment.question.multiple_responses.new.multiple_choice_header')
          )

          # Switch MCQ to MRQ
          click_button I18n.t('course.assessment.question.multiple_responses.switch_question_type_button.switch_to_mrq')
          expect(page).to have_text(
            I18n.t('course.assessment.question.multiple_responses.new.multiple_response_header')
          )

          # Switch MRQ to MCQ
          click_button I18n.t('course.assessment.question.multiple_responses.switch_question_type_button.switch_to_mcq')
          expect(page).to have_text(
            I18n.t('course.assessment.question.multiple_responses.new.multiple_choice_header')
          )
        end
      end

      scenario 'I can switch MRQ to MCQ, and back to MRQ, type for a new question' do
        visit course_assessment_path(course, assessment)
        wait_for_page
        click_on 'New Question'
        new_mrq_page = window_opened_by { click_link 'Multiple Response (MRQ)' }

        within_window new_mrq_page do
          wait_for_page
          expect(page).to have_text(
            I18n.t('course.assessment.question.multiple_responses.new.multiple_response_header')
          )

          # Switch MRQ to MCQ
          click_button I18n.t('course.assessment.question.multiple_responses.switch_question_type_button.switch_to_mcq')
          expect(page).to have_text(
            I18n.t('course.assessment.question.multiple_responses.new.multiple_choice_header')
          )

          # Switch MCQ to MRQ
          click_button I18n.t('course.assessment.question.multiple_responses.switch_question_type_button.switch_to_mrq')
          expect(page).to have_text(
            I18n.t('course.assessment.question.multiple_responses.new.multiple_response_header')
          )
        end
      end

      scenario 'I can create a new multiple response question' do
        skill = create(:course_assessment_skill, course: course)
        visit course_assessment_path(course, assessment)
        wait_for_page
        click_on 'New Question'
        new_mrq_page = window_opened_by { click_link 'Multiple Response (MRQ)' }

        within_window new_mrq_page do
          expect(current_path).to eq(
            new_course_assessment_question_multiple_response_path(course, assessment)
          )
          wait_for_page
          expect(page).to have_text(
            I18n.t('course.assessment.question.multiple_responses.new.multiple_response_header')
          )

          question_attributes = attributes_for(:course_assessment_question_multiple_response)
          fill_in 'title', with: question_attributes[:title]
          fill_in_rails_summernote('.question_multiple_response_description', question_attributes[:description])
          fill_in_rails_summernote('.question_multiple_response_staff_only_comments',
                                   question_attributes[:staff_only_comments])
          fill_in 'maximum_grade', with: question_attributes[:maximum_grade]

          show_skills = "$('select[name=\"question_multiple_response[question_assessment][skill_ids][]\"]').show()"
          page.execute_script show_skills
          within find_field('question_multiple_response[question_assessment][skill_ids][]') do
            select skill.title
          end

          # Add an option
          correct_option_attributes =
            attributes_for(:course_assessment_question_multiple_response_option, :correct)
          within find('#new_question_multiple_response_option') do
            fill_in_rails_summernote '.question_multiple_response_options_option',
                                     correct_option_attributes[:option]
            fill_in_rails_summernote '.question_multiple_response_options_explanation',
                                     correct_option_attributes[:explanation]
            check first('input[type="checkbox"]')[:name]
          end
          click_button I18n.t('helpers.buttons.create')

          question_created = assessment.questions.first.specific
          expect(page).
            to have_selector('div', text: I18n.t('course.assessment.question.multiple_responses.create.success'))
          expect(question_created).not_to be_multiple_choice
          expect(question_created.question_assessments.first.skills).to contain_exactly(skill)
          expect(question_created.options).to be_present
        end
      end

      scenario 'I can create a new multiple choice question' do
        visit course_assessment_path(course, assessment)
        wait_for_page
        click_on 'New Question'
        new_mcq_page = window_opened_by { click_link 'Multiple Choice (MCQ)' }

        within_window new_mcq_page do
          expect(current_path).to eq(
            new_course_assessment_question_multiple_response_path(course, assessment)
          )
          wait_for_page
          expect(page).to have_text(
            I18n.t('course.assessment.question.multiple_responses.new.multiple_choice_header')
          )
          question_attributes = attributes_for(:course_assessment_question_multiple_response)
          fill_in 'title', with: question_attributes[:title]
          fill_in 'maximum_grade', with: question_attributes[:maximum_grade]

          # Fill in the option and explanation first or form can't be submitted when js is on.
          correct_option_attributes =
            attributes_for(:course_assessment_question_multiple_response_option, :correct)
          within find('#new_question_multiple_response_option') do
            fill_in_rails_summernote '.question_multiple_response_options_option',
                                     correct_option_attributes[:option]
            fill_in_rails_summernote '.question_multiple_response_options_explanation',
                                     correct_option_attributes[:explanation]
          end

          click_button I18n.t('helpers.buttons.create')

          # Cannot create multiple choice question without a correct option
          expect(current_path).to eq(
            course_assessment_question_multiple_responses_path(course, assessment)
          )
          expect(page).to have_text(
            I18n.t('activerecord.errors.models.course/assessment/question/' \
                   'multiple_response.attributes.options.no_correct_option')
          )

          # Create a correct option
          within find('#new_question_multiple_response_option') do
            fill_in_rails_summernote '.question_multiple_response_options_option',
                                     correct_option_attributes[:option]
            fill_in_rails_summernote '.question_multiple_response_options_explanation',
                                     correct_option_attributes[:explanation]
            check first('input[type="checkbox"]')[:name]
          end

          click_button I18n.t('helpers.buttons.create')

          expect(current_path).to eq(course_assessment_path(course, assessment))
          question_created = assessment.questions.first.specific
          expect(page).
            to have_selector('div', text: I18n.t('course.assessment.question.multiple_responses.create.success'))
          expect(question_created).to be_multiple_choice
          expect(question_created.options).to be_present
        end
      end

      scenario 'I can edit a question, change MRQ to MCQ and back to MRQ, and delete an option' do
        mrq = create(:course_assessment_question_multiple_response, assessment: assessment,
                                                                    options: [])
        options = [
          attributes_for(:course_assessment_question_multiple_response_option, :wrong),
          attributes_for(:course_assessment_question_multiple_response_option, :correct)
        ]
        visit course_assessment_path(course, assessment)

        edit_path = edit_course_assessment_question_multiple_response_path(course, assessment, mrq)
        find_link(nil, href: edit_path).click

        maximum_grade = 999.9
        fill_in 'maximum_grade', with: maximum_grade
        click_button I18n.t('helpers.buttons.update')

        expect(current_path).to eq(course_assessment_path(course, assessment))
        expect(mrq.reload.maximum_grade).to eq(maximum_grade)

        visit edit_path
        options.each_with_index do |option, i|
          click_link I18n.t('course.assessment.question.multiple_responses.form.add_option')
          within all('.edit_question_multiple_response ' \
                     'tr.question_multiple_response_option')[i] do
            # A custom css selector, :last is added here because +fill_in_rails_summernote+ doesn't
            # acknowledge the scope defined by capabara.
            # This works only if +click_link+ is executed before each option.
            fill_in_rails_summernote '.question_multiple_response_options_option:last',
                                     option[:option]
            fill_in_rails_summernote '.question_multiple_response_options_explanation:last',
                                     option[:explanation]
            if option[:correct]
              check first('input[type="checkbox"]')[:name]
            else
              uncheck first('input[type="checkbox"]')[:name]
            end
          end
        end
        find(:button, I18n.t('helpers.buttons.update')).click

        expect(page).to have_selector('div.alert.alert-success')
        expect(current_path).to eq(course_assessment_path(course, assessment))
        expect(mrq.reload.options.count).to eq(options.count)

        # Switching in edit page
        # Switch MRQ to MCQ
        visit edit_path
        click_button I18n.t('course.assessment.question.multiple_responses.switch_question_type_button.switch_to_mcq')
        click_button 'Continue'
        expect(page).to have_text(
          I18n.t('course.assessment.question.multiple_responses.form.multiple_choice_option')
        )

        # Switch MCQ to MRQ
        click_button I18n.t('course.assessment.question.multiple_responses.switch_question_type_button.switch_to_mrq')
        click_button 'Continue'
        expect(page).to have_text(
          I18n.t('course.assessment.question.multiple_responses.form.multiple_response_option')
        )

        # Switching in assessment show page
        visit course_assessment_path(course, assessment)

        # Switch MRQ to MCQ
        click_button 'Change to Multiple Choice (MCQ)'
        click_button 'Change to MCQ'
        expect_toastify('Question type successfully changed.')
        expect(page).to have_text(
          I18n.t('course.assessment.question.multiple_responses.question_type.multiple_choice')
        )
        expect(page).to have_button('Change to Multiple Response (MRQ)')

        # Delete all MCQ options
        visit edit_path
        all('tr.question_multiple_response_option').each do |element|
          within element do
            click_link I18n.t('course.assessment.question.multiple_responses.option_fields.remove')
          end
        end
        click_button I18n.t('helpers.buttons.update')

        expect(current_path).to eq(course_assessment_path(course, assessment))
        expect(page).to have_selector('div.alert.alert-success')
        expect(mrq.reload.options.count).to eq(0)
      end

      scenario 'I can delete a question' do
        mrq = create(:course_assessment_question_multiple_response, assessment: assessment)
        visit course_assessment_path(course, assessment)
        wait_for_page
        within find('section', text: mrq.title) { click_button 'Delete' }
        click_button 'Delete question'

        expect_toastify('Question successfully deleted.')
        expect(page).not_to have_content(mrq.title)
      end
    end

    context 'As a Student' do
      let(:user) { create(:course_student, course: course).user }

      scenario 'I cannot add questions', js: false do
        visit new_course_assessment_question_multiple_response_path(course, assessment)

        expect(page.status_code).to eq(403)
      end
    end
  end
end
