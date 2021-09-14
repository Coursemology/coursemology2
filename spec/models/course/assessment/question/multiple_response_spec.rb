# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::MultipleResponse do
  it { is_expected.to act_as(Course::Assessment::Question) }
  it 'has many options' do
    expect(subject).to have_many(:options).
      class_name(Course::Assessment::Question::MultipleResponseOption.name).
      dependent(:destroy)
  end
  it { is_expected.to accept_nested_attributes_for(:options) }

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    describe '#auto_gradable?' do
      subject { create(:course_assessment_question_multiple_response) }
      it 'returns true' do
        expect(subject.auto_gradable?).to be(true)
      end
    end

    describe '#attempt' do
      let(:course) { create(:course) }
      let(:student_user) { create(:course_student, course: course).user }
      let(:assessment) { create(:assessment, course: course) }
      let(:question) do
        create(:course_assessment_question_multiple_response, assessment: assessment)
      end
      let(:submission) { create(:submission, assessment: assessment, creator: student_user) }
      subject { question }

      it 'returns an Answer' do
        expect(subject.attempt(submission)).to be_a(Course::Assessment::Answer)
      end

      context 'when last_attempt is given' do
        let(:last_attempt) do
          build(:course_assessment_answer_multiple_response, :with_one_correct_option,
                question: question.question)
        end

        it 'builds a new answer with old options' do
          answer = subject.attempt(submission, last_attempt).actable
          answer.save!

          expect(last_attempt.option_ids).
            to contain_exactly(*answer.answer_options.map(&:option_id))
        end
      end
    end

    describe '#question_type' do
      context 'when question can have more than one correct option' do
        subject { build(:course_assessment_question_multiple_response) }
        let!(:another_correct_option) do
          create(:course_assessment_question_multiple_response_option, :correct, question: subject)
        end

        it 'returns multiple response' do
          expect(subject.question_type).to(
            eq I18n.t('course.assessment.question.multiple_responses.question_type.multiple_response')
          )
        end
      end

      context 'when question has only one correct option' do
        subject { build(:course_assessment_question_multiple_response, :multiple_choice) }

        it 'returns multiple choice' do
          expect(subject.question_type).to(
            eq I18n.t('course.assessment.question.multiple_responses.question_type.multiple_choice')
          )
        end
      end
    end

    describe '#ordered_options' do
      let(:course_mrq_randomized) { create(:course, :with_mrq_options_randomization_enabled) }
      let(:seed) { Random.new_seed }

      context 'when question is randomized' do
        subject { build(:course_assessment_question_multiple_response, :randomized) }

        it 'returns a shuffled order of its options' do
          expected_ordered_options = subject.options.shuffle(random: Random.new(seed))

          expect(subject.ordered_options(seed, course_mrq_randomized).map(&:option)).to(
            eq expected_ordered_options.map(&:option)
          )
        end
      end

      context 'when question is randomized and has options that ignore randomization' do
        subject { build(:course_assessment_question_multiple_response, :randomized, :with_non_randomized_option) }

        it 'returns a shuffled order of its randomized options appended by the non-randomized options' do
          randomized_options = subject.options.select { |o| !o.ignore_randomization }
          randomized_options = randomized_options.shuffle(random: Random.new(seed))
          non_randomized_options = subject.options.select { |o| o.ignore_randomization }
          expected_ordered_options = randomized_options + non_randomized_options

          expect(subject.ordered_options(seed, course_mrq_randomized).map(&:option)).to(
            eq expected_ordered_options.map(&:option)
          )
        end
      end
    end
  end
end
