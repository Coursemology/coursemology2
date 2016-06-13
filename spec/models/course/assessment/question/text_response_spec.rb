# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::TextResponse, type: :model do
  it { is_expected.to act_as(Course::Assessment::Question) }
  it 'has many solutions' do
    expect(subject).to have_many(:solutions).
      class_name(Course::Assessment::Question::TextResponseSolution.name).
      dependent(:destroy)
  end
  it { is_expected.to accept_nested_attributes_for(:solutions) }

  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    describe '#auto_gradable?' do
      subject { create(:course_assessment_question_text_response) }
      it 'returns true' do
        expect(subject.auto_gradable?).to be(true)
      end
    end

    describe '#attempt' do
      subject { create(:course_assessment_question_text_response) }
      let(:assessment) { subject.assessment }
      let(:submission) { create(:course_assessment_submission, assessment: assessment) }

      it 'returns an Answer' do
        expect(subject.attempt(submission)).to be_a(Course::Assessment::Answer)
      end

      it 'associates the answer with the submission' do
        answer = subject.attempt(submission)
        expect(submission.text_response_answers).to include(answer.actable)
      end
    end

    describe 'validations' do
      subject { create(:course_assessment_question_text_response, maximum_grade: 10) }

      it 'validates that solution grade does not exceed maximum grade ' do
        subject.solutions.first.grade = 20

        expect(subject.valid?).to be(false)
        expect(subject.errors[:maximum_grade]).to include(
          I18n.t('activerecord.errors.models.course/assessment/question/text_response.attributes'\
            '.maximum_grade.invalid_grade')
        )
      end
    end
  end
end
