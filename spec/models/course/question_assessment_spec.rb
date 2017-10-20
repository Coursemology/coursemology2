# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::QuestionAssessment do
  it { is_expected.to belong_to(:assessment) }
  it { is_expected.to belong_to(:question) }

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    subject { create(:course_question_assessment, question: question) }

    describe '#display_title' do
      context 'when title is nil' do
        let(:question) { create(:course_assessment_question, title: nil) }

        it 'returns Question N' do
          expect(subject.display_title).to eq I18n.t('activerecord.course/assessment/question.question_number')
        end
      end

      context 'when there is a title' do
        let(:question) { create(:course_assessment_question) }

        it 'returns question_with_title translation' do
          expect(subject.display_title).to eq I18n.t('activerecord.course/assessment/question.question_with_title')
        end
      end
    end

    describe '.default_scope' do
      let(:assessment) { create(:assessment) }
      let!(:questions) { create_list(:course_question_assessment, 2, assessment: assessment) }
      it 'orders by ascending weight' do
        weights = assessment.question_assessments.pluck(:weight)
        expect(weights.length).to be > 1
        expect(weights.each_cons(2).all? { |a, b| a <= b }).to be_truthy
      end
    end
  end
end
