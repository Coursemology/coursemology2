# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question do
  class self::TestPolymorphicQuestion < ActiveRecord::Base
    acts_as :question, class_name: Course::Assessment::Question.name

    def self.table_name
      'course_assessment_questions'
    end
  end

  it { is_expected.to be_actable }
  it { is_expected.to belong_to(:assessment) }
  it { is_expected.to have_and_belong_to_many(:tags) }

  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    subject { build_stubbed(:course_assessment_question) }

    describe '#auto_gradable?' do
      it 'defaults to false' do
        expect(subject.auto_gradable?).to eq(false)
      end

      context 'when the question is polymorphic' do
        let(:question) { self.class::TestPolymorphicQuestion.new }
        subject { question.question }

        it "calls the polymorphic object's methods" do
          expect(question).to receive(:auto_gradable?).and_return(true)
          expect(subject.auto_gradable?).to eq(true)
        end
      end
    end

    describe '#auto_grader' do
      it 'defaults to raise NotImplementedError' do
        expect { subject.auto_grader }.to raise_error(NotImplementedError)
      end

      context 'when the question is polymorphic' do
        let(:question) { self.class::TestPolymorphicQuestion.new }
        subject { question.question }

        it "calls the polymorphic object's methods" do
          expect(question).to receive(:auto_gradable?).and_return(true)
          expect(question).to receive(:auto_grader).and_return(
            double(Course::Assessment::Answer::AutoGradingService))
          subject.auto_grader
        end
      end
    end

    describe '#attempt' do
      it 'fails' do
        expect { subject.attempt(nil) }.to raise_error(NotImplementedError)
      end

      context 'when the question is polymorphic' do
        let(:question) { self.class::TestPolymorphicQuestion.new }
        subject { question.question }

        it "calls the polymorphic object's methods" do
          expect(question).to receive(:attempt).and_return([])
          subject.attempt(nil)
        end

        context 'when the question does not implement #attempt' do
          it 'fails' do
            expect { subject.attempt(nil) }.to raise_error(NotImplementedError)
          end
        end
      end
    end

    describe '#not_correctly_answered' do
      let(:assessment) do
        assessment = build(:assessment)
        create_list(:course_assessment_question_multiple_response, 3, assessment: assessment)
        assessment
      end
      let(:submission) { create(:course_assessment_submission, assessment: assessment) }

      context 'when there is no answer' do
        it 'returns not correctly answered questions' do
          expect(assessment.questions.not_correctly_answered(submission)).
            to contain_exactly(*assessment.questions)
        end
      end

      context 'when some of the questions are answered correctly' do
        it 'returns not correctly answered questions' do
          question = assessment.questions.first
          answer = question.attempt(submission)
          answer.correct = true
          answer.save

          expect(assessment.questions.not_correctly_answered(submission)).
            to contain_exactly(*(assessment.questions - [question]))
        end
      end
    end

    describe '.default_scope' do
      let(:assessment) { create(:course_assessment_assessment) }
      let!(:questions) { create_list(:course_assessment_question, 2, assessment: assessment) }
      it 'orders by ascending weight' do
        weights = assessment.questions.pluck(:weight)
        expect(weights.length).to be > 1
        expect(weights.each_cons(2).all? { |a, b| a <= b }).to be_truthy
      end
    end
  end
end
