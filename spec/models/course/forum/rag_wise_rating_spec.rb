# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Forum::RagWiseRating, type: :model do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:user) { create(:user) }

    describe 'validations' do
      subject { build(:course_forum_rag_wise_rating) }

      it { is_expected.to be_valid }

      it 'requires original_content' do
        subject.original_content = nil
        expect(subject).not_to be_valid
        expect(subject.errors[:original_content]).to be_present
      end

      it 'allows a nil rating (initialized but not yet scored)' do
        subject.rating = nil
        expect(subject).to be_valid
      end
    end

    describe 'associations and score snapshot' do
      let(:post) { create(:course_discussion_post, is_ai_generated: true) }

      it 'optionally belongs to a post and snapshots the quality scores' do
        rating = create(:course_forum_rag_wise_rating, post: post,
                                                       faithfulness_score: 0.2, answer_relevance_score: 0.7)
        expect(rating.post).to eq(post)
        expect(rating.faithfulness_score).to eq(0.2)
        expect(rating.answer_relevance_score).to eq(0.7)
        expect(post.rag_wise_rating).to eq(rating)
      end
    end

    describe 'one active rating per post' do
      let(:post) { create(:course_discussion_post, is_ai_generated: true) }

      it 'forbids two ratings pointing at the same post' do
        create(:course_forum_rag_wise_rating, post: post)
        expect do
          create(:course_forum_rag_wise_rating, post: post)
        end.to raise_error(ActiveRecord::RecordNotUnique)
      end

      it 'allows multiple detached (post-less) ratings' do
        create(:course_forum_rag_wise_rating, post: nil)
        expect do
          create(:course_forum_rag_wise_rating, post: nil)
        end.to change(described_class, :count).by(1)
      end
    end

    describe 'capturing edited content from the post lifecycle' do
      let(:post) do
        create(:course_discussion_post, is_ai_generated: true, workflow_state: 'draft', text: 'final answer')
      end
      let!(:rating) { create(:course_forum_rag_wise_rating, post: post) }

      it 'captures the edited content when the post is published (accepted)' do
        # Deferred workflow persistence: publish! sets the state in memory; the save persists it (as the real
        # forum publish flow does), firing the capture hook.
        post.publish!
        post.save!
        expect(rating.reload.edited_content).to eq('final answer')
      end

      it 'captures the edited content before the post is rejected (destroyed), retaining the rating' do
        expect { post.destroy }.not_to change(described_class, :count)
        rating.reload
        expect(rating.edited_content).to eq('final answer')
        expect(rating.post_id).to be_nil
      end
    end
  end
end
