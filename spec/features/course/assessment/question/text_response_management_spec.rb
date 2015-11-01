require 'rails_helper'

RSpec.describe 'Course: Assessments: Questions: Text Response Management' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:course_assessment_assessment, course: course) }
    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { course.creator }

      scenario 'I can create a new question' do
        visit course_assessment_path(course, assessment)
        click_link I18n.t('course.assessment.assessments.show.new_question.text_response')

        expect(current_path).to eq(\
          new_course_assessment_question_text_response_path(course, assessment))
        question_attributes = attributes_for(:course_assessment_question_text_response)
        fill_in 'title', with: question_attributes[:title]
        fill_in 'description', with: question_attributes[:description]
        fill_in 'maximum_grade', with: question_attributes[:maximum_grade]
        click_button 'submit'

        expect(current_path).to eq(course_assessment_path(course, assessment))
        expect(page).to have_content_tag_for(assessment.questions.first.specific)
      end

      scenario 'I can edit a question', js: true do
        question = create(:course_assessment_question_text_response, assessment: assessment,
                          solutions: [])
        solutions = [
          attributes_for(:course_assessment_question_text_response_solution, :keyword),
          attributes_for(:course_assessment_question_text_response_solution, :exact_match)
        ]
        visit course_assessment_path(course, assessment)

        edit_path = edit_course_assessment_question_text_response_path(course, assessment, question)
        find_link(nil, href: edit_path).click

        maximum_grade = 9999
        fill_in 'maximum_grade', with: maximum_grade
        click_button 'submit'

        expect(current_path).to eq(course_assessment_path(course, assessment))
        expect(question.reload.maximum_grade).to eq(maximum_grade)

        visit edit_path

        solutions.each_with_index do |solution, i|
          click_link I18n.t('course.assessment.question.text_responses.form.add_solution')
          within all('.edit_question_text_response '\
            'tr.question_text_response_solution')[i] do
            fill_in find('textarea.text-response-solution')[:name], with: solution[:solution]
            fill_in find('textarea.text-response-explanation')[:name],
                    with: solution[:explanation]
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
        click_button 'submit'
        expect(current_path).to eq(course_assessment_path(course, assessment))
        expect(page).to have_selector('div.alert.alert-success')
      end

      scenario 'I can delete a question' do
        question = create(:course_assessment_question_text_response, assessment: assessment)
        visit course_assessment_path(course, assessment)

        delete_path = course_assessment_question_text_response_path(course, assessment, question)
        find_link(nil, href: delete_path).click

        expect(current_path).to eq(course_assessment_path(course, assessment))
        expect(page).not_to have_content_tag_for(question)
      end
    end

    context 'As a Student' do
      let(:user) { create(:course_user, :approved, course: course).user }

      scenario 'I cannot add questions' do
        visit new_course_assessment_question_text_response_path(course, assessment)

        expect(page.status_code).to eq(403)
      end
    end
  end
end
