# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Answer::RubricAutoGradingService do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:assessment) { create(:assessment, :published_with_rubric_question) }
    let(:question) { assessment.questions.first.specific }
    let(:submission) do
      create(:submission, :attempting, assessment: assessment)
    end
    let(:answer) do
      create(:course_assessment_answer_rubric_based_response, :submitted,
             question: question.acting_as, submission: submission).answer
    end
    let!(:grading) do
      create(:course_assessment_answer_auto_grading, answer: answer)
    end

    describe '#process_llm_grading_response' do
      context 'with valid LLM response' do
        let(:valid_response) do
          {
            'category_grades' => [
              {
                'category_id' => question.categories.first.id,
                'criterion_id' => question.categories.first.criterions.first.id,
                'grade' => question.categories.first.criterions.first.grade,
                'explanation' => 'selection explanation'
              }
            ],
            'overall_feedback' => 'overall feedback'
          }
        end
        it 'processes category grades' do
          result = subject.send(:process_llm_grading_response, question, answer.actable, valid_response)
          expect(result[0]).to be true # always correct for rubric questions
          expect(result[1]).to eq(question.categories.first.criterions.first.grade) # grade
          expect(result[2]).to contain_exactly('success') # messages
          expect(result[3]).to eq('overall feedback') # feedback
        end
        it 'updates answer selections' do
          expect(answer.actable).to receive(:assign_params).with(hash_including(:selections_attributes))
          subject.send(:process_llm_grading_response, question, answer.actable, valid_response)
        end
      end
    end

    describe '#process_category_grades' do
      let(:category) { question.categories.first }
      let(:criterion) { category.criterions.first }
      let(:llm_response) do
        {
          'category_grades' => [
            {
              'category_id' => category.id,
              'criterion_id' => criterion.id,
              'explanation' => 'selection explanation'
            }
          ]
        }
      end
      it 'processes category grades correctly' do
        result = subject.send(:process_category_grades, question, llm_response)
        expect(result.size).to eq(1)
        expect(result.first[:category_id]).to eq(category.id)
        expect(result.first[:criterion_id]).to eq(criterion.id)
        expect(result.first[:grade]).to eq(criterion.grade)
        expect(result.first[:explanation]).to eq('selection explanation')
      end
      it 'ignores non-existent categories' do
        llm_response['category_grades'] << { 'category_id' => -1, 'criterion_id' => -1 }
        llm_response['category_grades'] << { 'category_id' => category.id, 'criterion_id' => -1 }
        result = subject.send(:process_category_grades, question, llm_response)
        expect(result.size).to eq(1)
        expect(result.first[:category_id]).to eq(category.id)
      end
    end

    describe '#update_answer_selections' do
      let(:category_grades) do
        [
          {
            category_id: question.categories.first.id,
            criterion_id: question.categories.first.criterions.first.id,
            grade: question.categories.first.criterions.first.grade,
            explanation: 'selection explanation'
          }
        ]
      end
      context 'when answer selections do not exist' do
        before do
          allow(answer.actable).to receive(:selections).and_return([])
        end
        it 'creates category grade instances' do
          expect(answer.actable).to receive(:create_category_grade_instances)
          expect(answer.actable).to receive(:reload)
          subject.send(:update_answer_selections, answer.actable, category_grades)
        end
      end
      context 'when answer selections exist' do
        let(:selection) do
          build_stubbed(:course_assessment_answer_rubric_based_response_selection,
                        category_id: question.categories.first.id)
        end
        before do
          allow(answer.actable).to receive(:selections).and_return([selection])
        end
        it 'assigns parameters to existing selections' do
          expect(answer.actable).to receive(:assign_params).with(
            hash_including(selections_attributes: array_including(
              hash_including(
                id: selection.id,
                criterion_id: question.categories.first.criterions.first.id,
                grade: question.categories.first.criterions.first.grade,
                explanation: 'selection explanation'
              )
            ))
          )
          subject.send(:update_answer_selections, answer.actable, category_grades)
        end
      end
    end

    describe '#create_ai_generated_draft_post' do
      let(:submission_question) do
        create(:course_assessment_submission_question, submission: submission, question: question.acting_as)
      end
      before do
        allow(answer.submission).to receive(:submission_questions).and_return(
          double(find_by: submission_question)
        )
      end
      it 'creates a AI-gernerated draft post' do
        expect do
          subject.send(:create_ai_generated_draft_post, answer, 'draft post')
        end.to change { Course::Discussion::Post.count }.by(1)
        post = Course::Discussion::Post.last
        expect(post.text).to eq('draft post')
        expect(post.is_ai_generated).to be true
        expect(post.workflow_state).to eq('draft')
        expect(post.title).to eq(answer.submission.assessment.title)
        expect(post.topic.pending_staff_reply).to be true
      end
      context 'when no submission question exists' do
        before do
          allow(answer.submission).to receive(:submission_questions).and_return(
            double(find_by: nil)
          )
        end
        it 'does not create a post' do
          expect do
            subject.send(:create_ai_generated_draft_post, answer, 'draft post')
          end.not_to(change { Course::Discussion::Post.count })
        end
      end
    end
  end
end
