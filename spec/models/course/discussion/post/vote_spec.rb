# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Discussion::Post::Vote do
  it { is_expected.to belong_to(:post).inverse_of(:votes) }

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:user) { create(:user) }
    let(:post) { create(:course_discussion_post) }

    describe '.upvotes' do
      let!(:vote) { post.votes.create(vote_flag: true, creator: user) }
      it 'retrieves all upvotes' do
        expect(post.votes.upvotes).not_to be_empty
        expect(post.votes.upvotes.all?(&:vote_flag)).to be(true)
      end
    end

    describe '.downvotes' do
      let!(:vote) { post.votes.create(vote_flag: false, creator: user) }
      it 'retrieves all upvotes' do
        expect(post.votes.downvotes).not_to be_empty
        expect(post.votes.downvotes.any?(&:vote_flag)).to be(false)
      end
    end
  end
end
