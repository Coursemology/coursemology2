# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Answer::MultipleResponse do
  it { is_expected.to act_as(Course::Assessment::Answer) }
  it 'has many answer_options' do
    expect(subject).to have_many(:answer_options).
      class_name(Course::Assessment::Answer::MultipleResponseOption.name).
      dependent(:destroy)
  end
  it 'has many options' do
    expect(subject).to have_many(:options).
      class_name(Course::Assessment::Question::MultipleResponseOption.name)
  end

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    describe '#reset_answer' do
      let(:answer) { create(:course_assessment_answer_multiple_response, :with_one_correct_option) }
      subject { answer.reset_answer }

      it 'removes all multiple response options' do
        expect(subject.specific.options.count).to eq(0)
      end

      it 'returns an Answer' do
        expect(subject).to be_a(Course::Assessment::Answer)
      end
    end

    describe '#compare_answer' do
      let(:assessment) { create(:assessment, :published_with_mrq_question) }
      let(:question) { assessment.questions.first }
      let(:answer1) do
        create(:course_assessment_answer_multiple_response, :with_all_correct_options,
               assessment: assessment, question: question)
      end
      let(:answer2) do
        create(:course_assessment_answer_multiple_response, :with_all_wrong_options,
               assessment: assessment, question: question)
      end
      let(:answer3) do
        create(:course_assessment_answer_multiple_response, :with_all_correct_options,
               assessment: assessment, question: question)
      end

      it 'compares if answers are the same or not' do
        expect(answer1.compare_answer(answer2)).to be_falsey
        expect(answer1.compare_answer(answer3)).to be_truthy
      end
    end
  end
end
