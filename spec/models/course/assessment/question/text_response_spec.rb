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

  it 'has many groups' do
    expect(subject).to have_many(:groups).
      class_name(Course::Assessment::Question::TextResponseComprehensionGroup.name).
      dependent(:destroy)
  end
  it { is_expected.to accept_nested_attributes_for(:groups) }

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    describe '#auto_gradable?' do
      context 'text response question' do
        subject { create(:course_assessment_question_text_response) }
        it 'returns true' do
          expect(subject.auto_gradable?).to be(true)
        end
      end

      context 'comprehension question' do
        subject { create(:course_assessment_question_text_response, :comprehension_question) }
        it 'returns true' do
          expect(subject.auto_gradable?).to be(true)
        end
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
      context 'text response question' do
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

    describe '#question_type' do
      let(:file_upload_question) { build(:course_assessment_question_text_response, :file_upload_question) }
      let(:text_response_question) { build(:course_assessment_question_text_response) }

      context 'when question type is file upload' do
        subject { file_upload_question.question_type }

        it 'returns correct question type' do
          is_expected.to eq(
            I18n.t('activerecord.attributes.models.course/assessment/question/text_response.file_upload')
          )
        end
      end

      context 'when question type is text response' do
        subject { text_response_question.question_type }

        it 'returns correct question type' do
          is_expected.to eq(
            I18n.t('activerecord.attributes.models.course/assessment/question/text_response.text_response')
          )
        end
      end
    end
  end
end
