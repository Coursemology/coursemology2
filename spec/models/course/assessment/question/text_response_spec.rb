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

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    describe '#auto_gradable?' do
      subject { create(:course_assessment_question_text_response) }
      it 'returns true' do
        expect(subject.auto_gradable?).to be(true)
      end
    end

    describe '#attempt' do
      let(:course) { create(:course) }
      let(:student_user) { create(:course_student, course: course).user }
      let(:assessment) { create(:assessment, course: course) }
      let(:question) { create(:course_assessment_question_text_response, assessment: assessment) }
      let(:submission) { create(:submission, assessment: assessment, creator: student_user) }
      subject { question }

      it 'returns an Answer' do
        expect(subject.attempt(submission)).to be_a(Course::Assessment::Answer)
      end

      context 'when last_attempt is given' do
        let(:last_attempt) { build(:course_assessment_answer_text_response) }

        it 'builds a new answer with old answer_text' do
          answer = subject.attempt(submission, last_attempt).actable
          answer.save!

          expect(last_attempt.answer_text).to eq(answer.answer_text)
        end
      end
    end

    describe '#file_upload_question?' do
      subject { question.file_upload_question? }

      context 'when hide_text is enabled' do
        let(:question) { build(:course_assessment_question_text_response, :file_upload_question) }
        it { is_expected.to eq(true) }
      end

      context 'when hide_text is disabled' do
        let(:question) { build(:course_assessment_question_text_response) }
        it { is_expected.to eq(false) }
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
