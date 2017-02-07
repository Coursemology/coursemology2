# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::MultipleResponseOption do
  it 'belongs to a question' do
    expect(subject).to belong_to(:question).
      class_name(Course::Assessment::Question::MultipleResponse.name)
  end

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    describe '.correct' do
      let(:question) { create(:course_assessment_question_multiple_response) }
      subject { question.options.correct }

      it 'only includes correct answers' do
        expect(subject.all?(&:correct?)).to eq(true)
      end
    end

    describe '.default_scope' do
      let(:question) { create(:course_assessment_question_multiple_response) }

      it 'orders by ascending weight' do
        weights = question.options.pluck(:weight)
        expect(weights.length).to be > 1
        expect(weights.each_cons(2).all? { |a, b| a <= b }).to be_truthy
      end
    end
  end
end
