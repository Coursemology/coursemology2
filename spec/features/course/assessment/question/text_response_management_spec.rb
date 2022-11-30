# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Assessments: Questions: Text Response Management', js: true do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, course: course) }
    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }

      scenario 'I can create a new text response question' do
        skill = create(:course_assessment_skill, course: course)
        visit course_assessment_path(course, assessment)
        click_on 'New Question'
        new_page = window_opened_by { click_link 'File Upload' }

        within_window new_page do
          expect(current_path).to eq(
            new_course_assessment_question_text_response_path(course, assessment)
          )
          question_attributes = attributes_for(:course_assessment_question_text_response)
          fill_in 'title', with: question_attributes[:title]
          fill_in_rails_summernote '.question_text_response_description', question_attributes[:description]
          fill_in_rails_summernote '.question_text_response_staff_only_comments',
                                   question_attributes[:staff_only_comments]
          fill_in 'maximum_grade', with: question_attributes[:maximum_grade]

          allow_attachment = "document.getElementById('question_text_response_allow_attachment').value = true"
          page.execute_script allow_attachment

          show_skills = "$('select[name=\"question_text_response[question_assessment][skill_ids][]\"]').show()"
          page.execute_script show_skills
          within find_field('skills') do
            select skill.title
          end
          click_button I18n.t('helpers.buttons.create')

          question_created = assessment.questions.first.specific
          expect(page).to have_selector('div', text: I18n.t('course.assessment.question.text_responses.create.success'))
          expect(question_created.question_assessments.first.skills).to contain_exactly(skill)
          expect(question_created.allow_attachment).to be_truthy
        end
      end

      scenario 'I can create a new file upload question' do
        visit course_assessment_path(course, assessment)
        click_on 'New Question'
        new_page = window_opened_by { click_link 'File Upload' }

        within_window new_page do
          file_upload_path = new_course_assessment_question_text_response_path(course, assessment)
          expect(current_path).to eq(file_upload_path)

          question_attributes = attributes_for(:course_assessment_question_text_response)
          fill_in 'title', with: question_attributes[:title]
          fill_in_rails_summernote '.question_text_response_description', question_attributes[:description]
          fill_in_rails_summernote '.question_text_response_staff_only_comments',
                                   question_attributes[:staff_only_comments]
          fill_in 'maximum_grade', with: question_attributes[:maximum_grade]
          click_button I18n.t('helpers.buttons.create')

          question_created = assessment.questions.first.specific
          expect(page).to have_selector('div', text: I18n.t('course.assessment.question.text_responses.create.success'))
          expect(question_created.hide_text).to be_truthy
          expect(question_created.allow_attachment).to be_truthy
        end
      end

      scenario 'I can edit a text response question and delete options' do
        question = create(:course_assessment_question_text_response, assessment: assessment,
                                                                     solutions: [])
        solutions = [
          attributes_for(:course_assessment_question_text_response_solution, :keyword),
          attributes_for(:course_assessment_question_text_response_solution, :exact_match)
        ]
        visit course_assessment_path(course, assessment)

        edit_path = edit_course_assessment_question_text_response_path(course, assessment, question)
        find_link(nil, href: edit_path).click

        maximum_grade = 999.9
        fill_in 'maximum_grade', with: maximum_grade
        click_button I18n.t('helpers.buttons.update')

        message = I18n.t('course.assessment.question.text_responses.update.success')
        expect(page).to have_selector('div.alert', text: message)
        expect(current_path).to eq(course_assessment_path(course, assessment))
        expect(question.reload.maximum_grade).to eq(maximum_grade)

        visit edit_path

        solutions.each_with_index do |solution, i|
          link = I18n.t('course.assessment.question.text_responses.form.add_solution')
          find('a.add_fields', text: link).click
          within all('.edit_question_text_response '\
                     'tr.question_text_response_solution')[i] do
            # A custom css selector, :last is added here because +fill_in_rails_summernote+ doesn't
            # acknowledge the scope defined by capabara.
            # This works only if +click_link+ is executed before each option.
            fill_in_rails_summernote '.question_text_response_solutions_explanation:last',
                                     solution[:explanation]
            find('textarea.text-response-solution').set solution[:solution]

            solution_type = find('select.text-response-solution-type', visible: :all)
            # Twitter Bootstrap hides <select> element and creates a div.
            # The usual #select method is broken as it does not seem to work with hidden elements.
            if solution[:exact_match]
              solution_type.find('option[value="exact_match"]', visible: :all).select_option
            else
              solution_type.find('option[value="keyword"]', visible: :all).select_option
            end
          end
        end
        click_button I18n.t('helpers.buttons.update')
        expect(current_path).to eq(course_assessment_path(course, assessment))
        expect(page).to have_selector('div.alert.alert-success')
        expect(question.reload.solutions.count).to eq(solutions.count)
        # Ensure that explanation has been saved by randomly checking on an explanation
        expect(question.reload.solutions.map(&:explanation).join).
          to include(solutions.sample[:explanation])

        # Delete all solutions from question
        visit edit_path
        all('tr.question_text_response_solution').each do |element|
          within element do
            click_link I18n.t('course.assessment.question.text_responses.solution_fields.remove')
          end
        end
        click_button I18n.t('helpers.buttons.update')

        expect(page).to have_selector('div.alert.alert-success')
        expect(current_path).to eq(course_assessment_path(course, assessment))
        expect(question.reload.solutions.count).to eq(0)
      end

      scenario 'I can delete a text response question' do
        question = create(:course_assessment_question_text_response, assessment: assessment)
        visit course_assessment_path(course, assessment)

        within find('section', text: question.title) { click_button 'Delete' }
        click_button 'Delete question'

        expect_toastify('Question successfully deleted.')
        expect(current_path).to eq(course_assessment_path(course, assessment))
        expect(page).not_to have_content(question.title)
      end
    end

    context 'As a Student' do
      let(:user) { create(:course_student, course: course).user }

      scenario 'I cannot add questions', js: false do
        visit new_course_assessment_question_text_response_path(course, assessment)

        expect(page.status_code).to eq(403)
      end
    end
  end
end
