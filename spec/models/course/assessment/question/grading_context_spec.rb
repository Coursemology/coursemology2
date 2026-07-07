# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::GradingContext do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:assessment) { create(:assessment) }
    let(:question) do
      create(:course_assessment_question_forum_post_response, assessment: assessment).acting_as
    end
    let(:sibling) do
      create(:course_assessment_question_text_response, assessment: assessment).acting_as
    end

    describe 'validations' do
      it 'rejects an unknown context_type' do
        context = described_class.new(question: question, context_type: 'bogus', identifier: 'a')

        expect(context).not_to be_valid
        expect(context.errors[:context_type]).to be_present
      end

      it 'requires a question source for sibling_question_answer' do
        context = described_class.new(question: question, context_type: 'sibling_question_answer', identifier: 'a')
        expect(context).not_to be_valid

        context.source = sibling
        expect(context).to be_valid
      end

      it 'requires a blank source for forum_thread' do
        context = described_class.new(question: question, context_type: 'forum_thread', identifier: 'a')
        expect(context).to be_valid

        context.source = sibling
        expect(context).not_to be_valid
      end

      it 'enforces a unique identifier per question' do
        described_class.create!(question: question, context_type: 'forum_thread', identifier: 'dup')
        duplicate = described_class.new(question: question, context_type: 'forum_thread', identifier: 'dup')

        expect(duplicate).not_to be_valid
      end
    end
  end
end
