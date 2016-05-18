# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Topics: Management' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:answer_comment) do
      create(:course_assessment_answer, :with_post, course: course)
    end
    let(:code_annotation) do
      create(:course_assessment_answer_programming_file_annotation, :with_post, course: course)
    end

    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:administrator) }

      scenario 'I can see all the comments' do
        answer_comment
        code_annotation
        visit course_topics_path(course)

        expect(page).to have_selector('div', text: answer_comment.question.assessment.title)
        pending 'Implement displaying of actual comments'
        expect(page).
          to have_selector('div', text: code_annotation.file.answer.question.assessment.title)
      end
    end
  end
end
