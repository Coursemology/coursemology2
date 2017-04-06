# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::SubmissionQuestion::CommentsController do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let!(:submission_question) { create(:submission_question) }
    let!(:user) { submission_question.submission.creator }
    let(:assessment) { submission_question.question.assessment }
    let(:course) { assessment.course }
    before { sign_in(user) }

    describe '#create' do
      subject do
        post :create, format: :js, course_id: course, assessment_id: assessment,
                      submission_question_id: submission_question,
                      discussion_post: {
                        text: comment
                      }
      end

      before do
        controller.instance_variable_set(:@submission_question, submission_question)
      end

      context 'when comment creation fails' do
        let(:comment) { nil }

        it 'returns HTTP 400' do
          subject
          expect(response.status).to eq(400)
        end
      end

      context 'when comment creation succeeds' do
        let(:comment) { 'new comment' }

        it 'returns HTTP 200' do
          subject
          expect(response.status).to eq(200)
        end

        it 'adds a new comment' do
          expect { subject }.to change(Course::Discussion::Post, :count).by(1)
        end
      end
    end
  end
end
