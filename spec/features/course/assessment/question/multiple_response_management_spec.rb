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

      scenario 'I can switch MCQ to MRQ, and back to MCQ, for a new question' do
        new_mcq_page = test_new_assessment_question_flow(course, assessment, 'Multiple Choice (MCQ)')

        within_window new_mcq_page do
          click_on 'Convert to MRQ'
          expect(page).to have_text('Responses')

          click_on 'Convert to MCQ'
          expect(page).to have_text('Choices')
        end
      end

      scenario 'I can switch MRQ to MCQ, and back to MRQ, for a new question' do
        new_mrq_page = test_new_assessment_question_flow(course, assessment, 'Multiple Response (MRQ)')

        within_window new_mrq_page do
          click_on 'Convert to MCQ'
          expect(page).to have_text('Choices')

          click_on 'Convert to MRQ'
          expect(page).to have_text('Responses')
        end
      end

      scenario 'I can create a new multiple response question' do
        skill = create(:course_assessment_skill, course: course)
        new_mrq_page = test_new_assessment_question_flow(course, assessment, 'Multiple Response (MRQ)')

        within_window new_mrq_page do
          question_attributes = attributes_for(:course_assessment_question_multiple_response)
          fill_in 'title', with: question_attributes[:title]
          fill_in_react_ck 'textarea[name=description]', question_attributes[:description]
          fill_in_react_ck 'textarea[name=staffOnlyComments]', question_attributes[:staff_only_comments]
          fill_in 'maximumGrade', with: question_attributes[:maximum_grade]

          find_field('Skills').click
          find('li', text: skill.title).click

          click_on 'Add a new response'

          within find_all('section', text: 'response').last do
            correct_option_attributes = attributes_for(:course_assessment_question_multiple_response_option, :correct)
            fill_in_react_ck 'textarea[name=option]', correct_option_attributes[:option]
            fill_in_react_ck 'textarea[name=explanation]', correct_option_attributes[:explanation]
            correct_checkbox = first('input[type=checkbox]', visible: false)
            correct_checkbox.check
          end

          click_button 'Save changes'
          expect(page).to have_current_path(course_assessment_path(course, assessment))

          question_created = assessment.questions.first.specific
          expect(question_created).not_to be_multiple_choice
          expect(question_created.question_assessments.first.skills).to contain_exactly(skill)
          expect(question_created.options).to be_present
        end
      end

      scenario 'I can create a new multiple choice question' do
        new_mcq_page = test_new_assessment_question_flow(course, assessment, 'Multiple Choice (MCQ)')

        within_window new_mcq_page do
          question_attributes = attributes_for(:course_assessment_question_multiple_response)
          fill_in 'title', with: question_attributes[:title]
          fill_in 'maximumGrade', with: question_attributes[:maximum_grade]

          click_on 'Add a new choice'

          choice_section = find_all('section', text: 'choice').last

          within choice_section do
            correct_option_attributes = attributes_for(:course_assessment_question_multiple_response_option, :correct)
            fill_in_react_ck 'textarea[name=option]', correct_option_attributes[:option]
            fill_in_react_ck 'textarea[name=explanation]', correct_option_attributes[:explanation]
            correct_checkbox = first('input[type=checkbox]', visible: false)
            correct_checkbox.uncheck
          end

          click_button 'Save changes'
          expect(page).to have_text('You must specify at least one correct choice.')

          within choice_section do
            correct_checkbox = first('input[type=checkbox]', visible: false)
            correct_checkbox.check
          end

          click_button 'Save changes'
          expect(page).to have_current_path(course_assessment_path(course, assessment))

          question_created = assessment.questions.first.specific
          expect(question_created).to be_multiple_choice
          expect(question_created.options).to be_present
        end
      end

      scenario 'I can edit a question, change MRQ to MCQ and back to MRQ, and delete an option' do
        mrq = create(:course_assessment_question_multiple_response, assessment: assessment)
        options = [
          attributes_for(:course_assessment_question_multiple_response_option, :wrong),
          attributes_for(:course_assessment_question_multiple_response_option, :correct)
        ]
        initial_options_count = mrq.options.count
        visit course_assessment_path(course, assessment)

        edit_path = edit_course_assessment_question_multiple_response_path(course, assessment, mrq)
        find_link(nil, href: edit_path).click

        maximum_grade = 999.9
        fill_in 'maximumGrade', with: maximum_grade
        click_button 'Save changes'
        expect(page).to have_current_path(course_assessment_path(course, assessment))
        expect(mrq.reload.maximum_grade).to eq(maximum_grade)

        visit edit_path
        options.each do |option|
          click_button 'Add a new response'

          within find_all('section', text: 'response').last do
            fill_in_react_ck 'textarea[name=option]', option[:option]
            fill_in_react_ck 'textarea[name=explanation]', option[:explanation]

            correct_checkbox = first('input[type=checkbox]', visible: false)
            if option[:correct]
              correct_checkbox.check
            else
              correct_checkbox.uncheck
            end
          end
        end

        click_button 'Save changes'
        expect(page).to have_current_path(course_assessment_path(course, assessment))
        expect(mrq.reload.options.count).to eq(initial_options_count + options.count)

        # Switching in edit page
        # Switch MRQ to MCQ
        visit edit_path
        click_button 'Convert to MCQ'
        find_all('button', text: 'Convert to MCQ').last.click
        expect(page).to have_text('Choices')

        # Switch MCQ to MRQ
        click_button 'Convert to MRQ'
        find_all('button', text: 'Convert to MRQ').last.click
        expect(page).to have_text('Responses')

        # Switching in assessment show page
        visit course_assessment_path(course, assessment)
        expect(page).to have_current_path(course_assessment_path(course, assessment))

        # Switch MRQ to MCQ
        click_button 'Convert to MCQ'
        find_all('button', text: 'Convert to MCQ').last.click
        expect_toastify('Question type successfully changed.')
        expect(page).to have_text(
          I18n.t('course.assessment.question.multiple_responses.question_type.multiple_choice')
        )
        expect(page).to have_button('Convert to MRQ')

        # Delete all MCQ options
        visit edit_path

        find_all('button[aria-label="Delete choice"]').each(&:click)
        expect(page).to have_button('Save changes')
        click_button 'Save changes'
        expect(page).to have_text('You must specify at least one correct choice.')

        find_all('button[aria-label="Undo delete choice"]').last.click
        expect(page).to have_button('Save changes')
        click_button 'Save changes'
        expect(page).to have_current_path(course_assessment_path(course, assessment))
        expect(mrq.reload.options.count).to eq(1)
      end

      scenario 'I cannot delete all answers in mrq question' do
        mrq = create(:course_assessment_question_multiple_response, assessment: assessment)

        visit course_assessment_path(course, assessment)

        edit_path = edit_course_assessment_question_multiple_response_path(course, assessment, mrq)
        find_link(nil, href: edit_path).click

        maximum_grade = 999.9
        fill_in 'maximumGrade', with: maximum_grade
        click_button 'Save changes'
        expect(page).to have_current_path(course_assessment_path(course, assessment))
        expect(mrq.reload.maximum_grade).to eq(maximum_grade)

        visit edit_path

        find_all('button[aria-label="Delete response"]').each(&:click)
        expect(page).to have_button('Save changes')
        click_button 'Save changes'
        expect(page).to have_text('You must specify at least one response.')

        find_all('button[aria-label="Undo delete response"]').last.click
        expect(page).to have_button('Save changes')
        click_button 'Save changes'
        expect(page).to have_current_path(course_assessment_path(course, assessment))
        expect(mrq.reload.options.count).to eq(1)
      end

      scenario 'I can delete a question' do
        mrq = create(:course_assessment_question_multiple_response, assessment: assessment)
        visit course_assessment_path(course, assessment)
        within find('section', text: mrq.title) { click_button 'Delete' }
        click_button 'Delete question'

        expect_toastify('Question successfully deleted.')
        expect(page).not_to have_content(mrq.title)
      end
    end

    context 'As a Student' do
      let(:user) { create(:course_student, course: course).user }

      scenario 'I cannot add questions' do
        visit new_course_assessment_question_multiple_response_path(course, assessment)

        expect_forbidden
      end
    end
  end
end
