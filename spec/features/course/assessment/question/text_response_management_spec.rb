# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Assessments: Questions: Text Response Management', js: true do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, course: course) }
    let(:max_attachment_default_text_response) { 0 }
    let(:max_attachment_default_file_upload) { 1 }

    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }

      scenario 'I can create a new file upload question' do
        skill = create(:course_assessment_skill, course: course)
        new_page = test_new_assessment_question_flow(course, assessment, 'File Upload')

        within_window new_page do
          expect(page).to have_current_path(
            new_course_assessment_question_text_response_path(course, assessment, { file_upload: true })
          )
          question_attributes = attributes_for(:course_assessment_question_text_response)
          fill_in 'title', with: question_attributes[:title]
          fill_in_react_ck 'textarea[name=description]', question_attributes[:description]
          fill_in_react_ck 'textarea[name=staffOnlyComments]', question_attributes[:staff_only_comments]
          fill_in 'maximumGrade', with: question_attributes[:maximum_grade]

          find_field('Skills').click

          find('li', text: skill.title).click

          click_button 'Save changes'
          expect(page).to have_current_path(course_assessment_path(course, assessment))

          question_created = assessment.questions.first.specific
          expect(question_created.question_assessments.first.skills).to contain_exactly(skill)
          expect(question_created.title).to eq(question_attributes[:title])
          expect(question_created.description).to include(question_attributes[:description])
          expect(question_created.staff_only_comments).to include(question_attributes[:staff_only_comments])
          expect(question_created.maximum_grade).to eq(question_attributes[:maximum_grade])
          expect(question_created.max_attachments).to eq(max_attachment_default_file_upload)
          expect(question_created.hide_text).to be_truthy
        end
      end

      scenario 'I can create a new text response question' do
        visit course_assessment_path(course, assessment)
        new_page = test_new_assessment_question_flow(course, assessment, 'Text Response')

        within_window new_page do
          file_upload_path = new_course_assessment_question_text_response_path(course, assessment)
          expect(page).to have_current_path(file_upload_path)

          question_attributes = attributes_for(:course_assessment_question_text_response)
          fill_in 'title', with: question_attributes[:title]
          fill_in_react_ck 'textarea[name=description]', question_attributes[:description]
          fill_in_react_ck 'textarea[name=staffOnlyComments]', question_attributes[:staff_only_comments]
          fill_in 'maximumGrade', with: question_attributes[:maximum_grade]

          click_button 'Save changes'
          expect(page).to have_current_path(course_assessment_path(course, assessment))

          question_created = assessment.questions.first.specific
          expect(question_created.title).to eq(question_attributes[:title])
          expect(question_created.description).to include(question_attributes[:description])
          expect(question_created.staff_only_comments).to include(question_attributes[:staff_only_comments])
          expect(question_created.maximum_grade).to eq(question_attributes[:maximum_grade])
          expect(question_created.max_attachments).to eq(max_attachment_default_text_response)
          expect(question_created.hide_text).not_to be_truthy
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

        title = 'Trial Text Response Question'
        description = 'Test of Creating Text Response Question'
        staff_only_comments = 'No comments from staff'
        maximum_grade = 999.9

        fill_in 'title', with: title
        fill_in_react_ck 'textarea[name=description]', description
        fill_in_react_ck 'textarea[name=staffOnlyComments]', staff_only_comments
        fill_in 'maximumGrade', with: maximum_grade

        click_button 'Save changes'

        expect(page).to have_current_path(course_assessment_path(course, assessment))
        expect(question.reload.title).to eq(title)
        expect(question.reload.description).to include(description)
        expect(question.reload.staff_only_comments).to include(staff_only_comments)
        expect(question.reload.maximum_grade).to eq(maximum_grade)
        expect(question.reload.max_attachments).to eq(max_attachment_default_text_response)

        visit edit_path

        solutions.each do |solution|
          click_button 'Add a new solution'

          within find_all('section', text: 'solution').last do
            fill_in 'solution', with: solution[:solution]
            fill_in_react_ck 'textarea[name=explanation]', solution[:explanation]
            fill_in 'grade', with: solution[:grade]

            solution_type = find('#solution-type', visible: :all)
            if solution[:exact_match]
              solution_type.find('option[value="exact_match"]', visible: :all).select_option
            else
              solution_type.find('option[value="keyword"]', visible: :all).select_option
            end
          end
        end

        click_button 'Save changes'

        expect(page).to have_current_path(course_assessment_path(course, assessment))
        expect(question.reload.max_attachments).to eq(max_attachment_default_text_response)
        expect(question.reload.solutions.count).to eq(solutions.count)

        # Delete all solutions from question
        visit edit_path

        find_all('button[aria-label="Delete solution"]').each(&:click)
        click_button 'Save changes'

        expect(page).to have_current_path(course_assessment_path(course, assessment))
        expect(question.reload.solutions.count).to eq(0)
      end

      scenario 'I can delete a text response question' do
        question = create(:course_assessment_question_text_response, assessment: assessment)
        visit course_assessment_path(course, assessment)

        within find('section', text: question.title) { find('button[aria-label="Delete"]').click }
        accept_prompt

        expect_toastify('Question successfully deleted.')
        expect(page).not_to have_content(question.title)
      end
    end

    context 'As a Student' do
      let(:user) { create(:course_student, course: course).user }

      scenario 'I cannot add questions' do
        visit new_course_assessment_question_text_response_path(course, assessment)

        expect_forbidden
      end
    end
  end
end
