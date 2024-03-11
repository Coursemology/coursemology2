# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Assessments: Questions: Text Response Management', js: true do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, course: course) }

    let(:single_file_attachment) { 'single_file_attachment' }
    let(:no_attachment) { 'no_attachment' }
    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }

      scenario 'I can create a new file upload question' do
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
          fill_in_react_ck 'textarea[name=description]', question_attributes[:description]
          fill_in_react_ck 'textarea[name=staffOnlyComments]', question_attributes[:staff_only_comments]
          fill_in 'maximumGrade', with: question_attributes[:maximum_grade]

          find_field('Skills').click

          find('li', text: skill.title).click

          click_button 'Save changes'
          wait_for_page

          question_created = assessment.questions.first.specific
          expect(question_created.question_assessments.first.skills).to contain_exactly(skill)
          expect(question_created.title).to eq(question_attributes[:title])
          expect(question_created.description).to include(question_attributes[:description])
          expect(question_created.staff_only_comments).to include(question_attributes[:staff_only_comments])
          expect(question_created.maximum_grade).to eq(question_attributes[:maximum_grade])
          expect(question_created.attachment_type).to eq(single_file_attachment)
          expect(question_created.hide_text).to be_truthy
        end
      end

      scenario 'I can create a new text response question' do
        visit course_assessment_path(course, assessment)
        click_on 'New Question'
        new_page = window_opened_by { click_link 'Text Response' }

        within_window new_page do
          file_upload_path = new_course_assessment_question_text_response_path(course, assessment)
          expect(current_path).to eq(file_upload_path)

          question_attributes = attributes_for(:course_assessment_question_text_response)
          fill_in 'title', with: question_attributes[:title]
          fill_in_react_ck 'textarea[name=description]', question_attributes[:description]
          fill_in_react_ck 'textarea[name=staffOnlyComments]', question_attributes[:staff_only_comments]
          fill_in 'maximumGrade', with: question_attributes[:maximum_grade]

          click_button 'Save changes'
          wait_for_page

          question_created = assessment.questions.first.specific
          expect(question_created.title).to eq(question_attributes[:title])
          expect(question_created.description).to include(question_attributes[:description])
          expect(question_created.staff_only_comments).to include(question_attributes[:staff_only_comments])
          expect(question_created.maximum_grade).to eq(question_attributes[:maximum_grade])
          expect(question_created.attachment_type).to eq(no_attachment)
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
        wait_for_page

        expect(current_path).to eq(course_assessment_path(course, assessment))
        expect(question.reload.title).to eq(title)
        expect(question.reload.description).to include(description)
        expect(question.reload.staff_only_comments).to include(staff_only_comments)
        expect(question.reload.maximum_grade).to eq(maximum_grade)
        expect(question.reload.attachment_type).to eq(no_attachment)

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
        wait_for_page

        expect(current_path).to eq(course_assessment_path(course, assessment))
        expect(question.reload.attachment_type).to eq(no_attachment)
        expect(question.reload.solutions.count).to eq(solutions.count)

        # Delete all solutions from question
        visit edit_path

        find_all('button[aria-label="Delete solution"]').each(&:click)
        click_button 'Save changes'
        wait_for_page

        expect(current_path).to eq(course_assessment_path(course, assessment))
        expect(question.reload.solutions.count).to eq(0)
      end

      scenario 'I can delete a text response question' do
        skip 'Flaky tests'
        question = create(:course_assessment_question_text_response, assessment: assessment)
        visit course_assessment_path(course, assessment)
        wait_for_page

        within find('section', text: question.title) { click_button 'Delete' }
        click_button 'Delete question'

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
