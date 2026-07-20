# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Rubric::AnswerEvaluation::Rating, type: :model do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:user) { create(:user) }
    let(:course) { create(:course, creator: user) }
    let(:assessment) { create(:assessment, :published_with_rubric_question, course: course) }
    let(:question) { assessment.questions.first.specific }
    let(:submission) { create(:submission, :submitted, assessment: assessment, creator: user) }
    let(:answer) do
      create(:course_assessment_answer_rubric_based_response, :submitted,
             question: question.acting_as, submission: submission).answer
    end
    let(:evaluation) do
      Course::Rubric::AnswerEvaluation.create!(answer: answer, evaluation_type: :grading, feedback: 'generated')
    end

    describe 'validations' do
      subject { evaluation.ratings.build(original_feedback: 'x', creator: user, updater: user) }

      it { is_expected.to be_valid }

      it 'requires original_feedback' do
        subject.original_feedback = nil
        expect(subject).not_to be_valid
        expect(subject.errors[:original_feedback]).to be_present
      end

      it 'allows a nil rating (initialized but not yet scored)' do
        subject.rating = nil
        expect(subject).to be_valid
      end
    end

    describe 'associations' do
      it 'belongs to an answer evaluation and optionally a post' do
        rating = evaluation.ratings.create!(original_feedback: 'x', creator: user, updater: user)
        expect(rating.answer_evaluation).to eq(evaluation)
        expect(rating.post).to be_nil
        expect(evaluation.ratings).to include(rating)
      end
    end

    describe 'one active rating per post' do
      let(:post) { create(:course_discussion_post, is_ai_generated: true) }

      it 'forbids two ratings pointing at the same post' do
        evaluation.ratings.create!(post: post, original_feedback: 'x', creator: user, updater: user)
        expect do
          evaluation.ratings.create!(post: post, original_feedback: 'y', creator: user, updater: user)
        end.to raise_error(ActiveRecord::RecordNotUnique)
      end

      it 'allows multiple detached (post-less) ratings' do
        evaluation.ratings.create!(post: nil, original_feedback: 'x', creator: user, updater: user)
        expect do
          evaluation.ratings.create!(post: nil, original_feedback: 'y', creator: user, updater: user)
        end.to change(described_class, :count).by(1)
      end
    end

    describe 'cascade and retention on deletion' do
      let(:post) { create(:course_discussion_post, is_ai_generated: true) }
      let!(:rating) { evaluation.ratings.create!(post: post, original_feedback: 'x', creator: user, updater: user) }

      it 'is destroyed when its answer evaluation is destroyed' do
        expect { evaluation.destroy }.to change(described_class, :count).by(-1)
      end

      it 'is retained (post_id nullified) when its post is destroyed' do
        expect { post.destroy }.not_to change(described_class, :count)
        expect(rating.reload.post_id).to be_nil
      end
    end

    describe 'capturing edited feedback from the post lifecycle' do
      let(:post) do
        create(:course_discussion_post, is_ai_generated: true, workflow_state: 'draft', text: 'final feedback')
      end
      let!(:rating) do
        evaluation.ratings.create!(post: post, original_feedback: 'generated', creator: user, updater: user)
      end

      it 'captures the edited feedback when the post is published (accepted)' do
        # Deferred workflow persistence: publish! sets the state in memory; the save persists it (as the real
        # discussion/forum publish flows do), firing the capture hook.
        post.publish!
        post.save!
        expect(rating.reload.edited_feedback).to eq('final feedback')
      end

      it 'captures the edited feedback before the post is rejected (destroyed), retaining the rating' do
        expect { post.destroy }.not_to change(described_class, :count)
        rating.reload
        expect(rating.edited_feedback).to eq('final feedback')
        expect(rating.post_id).to be_nil
      end
    end
  end
end
