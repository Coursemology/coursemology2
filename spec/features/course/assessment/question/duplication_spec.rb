# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Assessments: Questions: Duplication Spec', js: true do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:source_assessment) do
      create(:assessment, :with_mcq_question, course: course).tap do |assessment|
        mcq_question = assessment.questions.first
        mcq_question.question_assessments.first.skills <<
          build(:course_assessment_skill, course: course)
      end
    end
    let(:destination_assessment) { create(:assessment, :with_programming_question, course: course) }

    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }

      scenario 'I can duplicate a question from one assessment to another' do
        destination_assessment
        visit course_assessment_path(course, source_assessment)

        expect(destination_assessment.questions.count).to be(1)

        within all('section', text: source_assessment.questions.first.title).first do
          click_button 'Duplicate'
        end

        wait_for_job

        expect do
          find('li', text: destination_assessment.title).click
          expect_toastify('Your question has been duplicated.')
        end.to change { destination_assessment.questions.count }.by(1)

        original_mcq_question = source_assessment.questions.last
        duplicated_mcq_question = destination_assessment.questions.last
        expect(duplicated_mcq_question.title).to eq(original_mcq_question.title)
        expect(duplicated_mcq_question.question_assessments.first.skills.first.id).
          to eq(original_mcq_question.question_assessments.first.skills.first.id)
      end
    end
  end
end
