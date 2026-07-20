# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Discussion::PostAiFeedbackRatingsController, type: :controller do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, :published_with_rubric_question, course: course) }
    let(:question) { assessment.questions.first.specific }
    let(:submission) { create(:submission, :submitted, assessment: assessment) }
    let(:answer) do
      create(:course_assessment_answer_rubric_based_response, :submitted,
             question: question.acting_as, submission: submission).answer
    end
    let(:submission_question) do
      create(:course_assessment_submission_question, submission: submission, question: question.acting_as)
    end
    let(:post) do
      create(:course_discussion_post, topic: submission_question.acting_as, is_ai_generated: true)
    end
    let(:evaluation) do
      Course::Rubric::AnswerEvaluation.create!(answer: answer, evaluation_type: :grading, feedback: 'generated')
    end
    let!(:rating) do
      evaluation.ratings.create!(post: post, original_feedback: 'generated',
                                 creator: User.system, updater: User.system)
    end

    before { controller_sign_in(controller, user) }

    subject do
      patch :update, params: { course_id: course, topic_id: post.topic_id, id: post.id, rating: 5 }
    end

    context 'when the user is course staff' do
      let(:user) { create(:course_teaching_assistant, course: course).user }

      it 'sets the numeric rating without capturing edited content yet' do
        expect(subject).to have_http_status(:ok)
        rating.reload
        expect(rating.rating).to eq(5)
        expect(rating.updater).to eq(user)
        # Edited feedback is captured from the post lifecycle (publish/reject), not this endpoint.
        expect(rating.edited_feedback).to be_nil
      end
    end

    context 'when the user is a student' do
      let(:user) { create(:course_student, course: course).user }

      it 'is forbidden and does not change the rating' do
        expect { subject }.to raise_error(CanCan::AccessDenied)
        expect(rating.reload.rating).to be_nil
      end
    end
  end
end
