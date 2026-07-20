# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::MockAnswersController, type: :controller do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:user) { create(:user) }
    let(:course) { create(:course, creator: user) }
    let(:assessment) { create(:assessment, course: course) }
    let(:question) do
      create(:course_assessment_question_forum_post_response, assessment: assessment).acting_as
    end
    let!(:grading_context) do
      Course::Assessment::Question::GradingContext.create!(
        question: question, context_type: 'forum_thread', identifier: 'thread_root'
      )
    end

    before { controller_sign_in(controller, user) }

    def member_params(extra = {})
      {
        course_id: course.id, assessment_id: assessment.id,
        question_id: question.id, on: :member
      }.merge(extra)
    end

    describe '#create' do
      it 'creates a named mock answer with its grading context content' do
        expect do
          post :create, params: member_params(
            mock_answer: {
              name: 'Borderline pass',
              answer_text: 'Sample answer',
              grading_contexts_attributes: [{ grading_context_id: grading_context.id, content: 'The opening post' }]
            }
          ), format: :json
        end.to change(Course::Assessment::Question::MockAnswer, :count).by(1)

        expect(response).to have_http_status(:ok)
        mock_answer = Course::Assessment::Question::MockAnswer.last
        expect(mock_answer.name).to eq('Borderline pass')
        expect(mock_answer.answer_text).to eq('Sample answer')
        expect(mock_answer.grading_context_prompt).to eq("[thread_root]\nThe opening post")
      end
    end

    describe '#update' do
      let!(:mock_answer) do
        question.mock_answers.create!(
          name: 'Original', answer_text: 'Old answer',
          grading_contexts_attributes: [{ grading_context_id: grading_context.id, content: 'Old context' }]
        )
      end

      # The client round-trips the join row's own id, so nested attributes update it in place.
      it 'renames the mock answer and updates its context in place (no duplicate row)' do
        expect do
          patch :update, params: member_params(
            id: mock_answer.id,
            mock_answer: {
              name: 'Renamed',
              answer_text: 'New answer',
              grading_contexts_attributes: [
                id: mock_answer.grading_contexts.first.id,
                grading_context_id: grading_context.id, content: 'New context'
              ]
            }
          ), format: :json
        end.not_to change(Course::Assessment::Question::MockAnswer::GradingContext, :count)

        expect(response).to have_http_status(:ok)
        mock_answer.reload
        expect(mock_answer.name).to eq('Renamed')
        expect(mock_answer.answer_text).to eq('New answer')
        expect(mock_answer.grading_context_prompt).to eq("[thread_root]\nNew context")
      end
    end

    describe '#index' do
      render_views

      let!(:mock_answer) do
        question.mock_answers.create!(
          name: '', answer_text: 'An answer',
          grading_contexts_attributes: [{ grading_context_id: grading_context.id, content: 'Some context' }]
        )
      end

      it 'returns each mock answer with its name (blank title kept as-is) and grading contexts' do
        get :index, params: member_params, format: :json

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        entry = body.find { |item| item['id'] == mock_answer.id }
        expect(entry['name']).to eq('')
        expect(entry['title']).to eq('')
        expect(entry['answerText']).to eq('An answer')
        expect(entry['gradingContexts']).to contain_exactly(
          'id' => mock_answer.grading_contexts.first.id,
          'gradingContextId' => grading_context.id, 'content' => 'Some context'
        )
      end
    end
  end
end
