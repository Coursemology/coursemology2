require 'rails_helper'

RSpec.describe 'Course: Assessments: Questions: Multiple Response Management' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:course_assessment_assessment, course: course) }
    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { course.creator }

      scenario 'I can create a new question' do
        visit course_assessment_path(course, assessment)
        click_link I18n.t('course.assessment.assessments.show.new_question.multiple_response')

        expect(current_path).to eq(\
          new_course_assessment_question_multiple_response_path(course, assessment))
        question_attributes = attributes_for(:course_assessment_question_multiple_response)
        fill_in 'title', with: question_attributes[:title]
        fill_in 'description', with: question_attributes[:description]
        fill_in 'maximum_grade', with: question_attributes[:maximum_grade]
        click_button 'submit'

        expect(current_path).to eq(course_assessment_path(course, assessment))
        expect(page).to have_content_tag_for(assessment.questions.first.specific)
      end

      scenario 'I can edit a question' do
        mrq = create(:course_assessment_question_multiple_response, assessment: assessment)
        visit course_assessment_path(course, assessment)

        edit_path = edit_course_assessment_question_multiple_response_path(course, assessment, mrq)
        find_link(nil, href: edit_path).click

        maximum_grade = 9999
        fill_in 'maximum_grade', with: maximum_grade
        click_button 'submit'

        expect(current_path).to eq(course_assessment_path(course, assessment))
        expect(mrq.reload.maximum_grade).to eq(maximum_grade)
      end

      scenario 'I can delete a question' do
        mrq = create(:course_assessment_question_multiple_response, assessment: assessment)
        visit course_assessment_path(course, assessment)

        delete_path = course_assessment_question_multiple_response_path(course, assessment, mrq)
        find_link(nil, href: delete_path).click

        expect(current_path).to eq(course_assessment_path(course, assessment))
        expect(page).not_to have_content_tag_for(mrq)
      end
    end

    context 'As a Student' do
      let(:user) { create(:course_user, :approved, course: course).user }

      scenario 'I cannot add questions' do
        visit new_course_assessment_question_multiple_response_path(course, assessment)

        expect(page.status_code).to eq(403)
      end
    end
  end
end
