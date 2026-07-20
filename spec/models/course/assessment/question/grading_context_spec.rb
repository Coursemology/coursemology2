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

    describe 'duplication' do
      let(:course) { assessment.course }
      let(:consumer) { create(:course_assessment_question_forum_post_response, assessment: assessment) }

      def duplicate(objects)
        Duplicator.new([], destination_course: course, current_course: course).duplicate(objects)
      end

      context 'with a forum_thread context (no source)' do
        before do
          described_class.create!(
            question: consumer.acting_as, context_type: 'forum_thread', identifier: 'thread'
          )
        end

        it 'copies the context onto the duplicate with a null source' do
          duplicated = duplicate(consumer)

          contexts = duplicated.grading_contexts
          expect(contexts.size).to eq(1)
          expect(contexts.first.context_type).to eq('forum_thread')
          expect(contexts.first.identifier).to eq('thread')
          expect(contexts.first.source).to be_nil
        end
      end

      context 'with a sibling_question_answer context' do
        let(:source_question) do
          create(:course_assessment_question_forum_post_response, assessment: assessment)
        end

        before do
          described_class.create!(
            question: consumer.acting_as, context_type: 'sibling_question_answer',
            source: source_question.acting_as, identifier: 'sibling'
          )
        end

        # The Duplicator imposes no order on the two co-duplicated questions, so the source linkage must hold
        # whichever is processed first.
        [%i[source_question consumer], %i[consumer source_question]].each do |order|
          it "re-points the duplicate context at the duplicate source (order: #{order.join(' then ')})" do
            originals = order.map { |name| send(name) }
            dup_by_original = originals.zip(duplicate(originals)).to_h
            dup_consumer = dup_by_original[consumer]
            dup_source = dup_by_original[source_question]

            context = dup_consumer.grading_contexts.find { |c| c.context_type == 'sibling_question_answer' }
            expect(context.identifier).to eq('sibling')
            expect(context.source).to eq(dup_source.acting_as)
            expect(context.source).not_to eq(source_question.acting_as)
          end
        end
      end
    end
  end
end
