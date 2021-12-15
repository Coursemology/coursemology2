# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Answer::ForumPostResponse do
  it { is_expected.to act_as(Course::Assessment::Answer) }
  it 'has many post_packs' do
    expect(subject).to have_many(:post_packs).
      class_name(Course::Assessment::Answer::ForumPost.name).
      dependent(:destroy).
      with_foreign_key(:answer_id).
      inverse_of(:answer)
  end

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    describe '#compute_post_packs' do
      let(:forum) { create(:forum) }
      let(:topic) { create(:forum_topic, forum: forum) }
      let(:parent_post) { create(:course_discussion_post, topic: topic.acting_as) }
      let(:child_post) { create(:course_discussion_post, topic: topic.acting_as, parent: parent_post) }
      let(:answer) { create(:course_assessment_answer_forum_post_response) }
      let(:answer_with_parent) { create(:course_assessment_answer_forum_post_response) }
      let!(:post_pack) do
        create(:course_assessment_answer_forum_post, topic: topic.acting_as, post: parent_post, answer: answer.actable)
      end
      let!(:post_pack_with_parent) do
        create(:course_assessment_answer_forum_post, parent: parent_post, topic: topic.acting_as, post: child_post,
                                                     answer: answer_with_parent.actable)
      end

      it 'computes a single post pack correctly' do
        post_packs = answer.compute_post_packs
        expect(post_packs.count).to eq(1)
        expect(post_packs[0].id).to eq(post_pack.id)
        expect(post_packs[0].forum_topic_id).to eq(topic.id)
        expect(post_packs[0].post_id).to eq(parent_post.id)
        expect(post_packs[0].post_text).to eq(parent_post.text)
        expect(post_packs[0].post_creator_id).to eq(parent_post.creator.id)
        expect(post_packs[0].post_updated_at.utc).to be_within(1.second).of parent_post.updated_at.utc
        expect(post_packs[0].answer_id).to eq(answer.id)
        expect(post_packs[0].forum_id).to eq(forum.id)
        expect(post_packs[0].forum_name).to eq(forum.name)
        expect(post_packs[0].topic_title).to eq(topic.title)
        expect(post_packs[0].is_topic_deleted).to eq(false)
        expect(post_packs[0].post_creator).to eq(parent_post.creator)
        expect(post_packs[0].is_post_updated).to eq(false)
        expect(post_packs[0].is_post_deleted).to eq(false)
        expect(post_packs[0].parent_id).to eq(nil)
        expect(post_packs[0].parent_text).to eq(nil)
        expect(post_packs[0].parent_creator_id).to eq(nil)
        expect(post_packs[0].parent_updated_at).to eq(nil)
        expect(post_packs[0].parent_creator).to eq(nil)
        expect(post_packs[0].is_parent_updated).to eq(nil)
        expect(post_packs[0].is_parent_deleted).to eq(nil)
      end

      it 'computes a post pack with a parent post correctly' do
        post_packs = answer_with_parent.compute_post_packs
        expect(post_packs.count).to eq(1)
        expect(post_packs[0].post_id).to eq(child_post.id) # Just a simple sanity check for child post
        expect(post_packs[0].parent_id).to eq(parent_post.id)
        expect(post_packs[0].parent_text).to eq(parent_post.text)
        expect(post_packs[0].parent_creator_id).to eq(parent_post.creator.id)
        expect(post_packs[0].parent_updated_at.utc).to be_within(1.second).of parent_post.updated_at.utc
        expect(post_packs[0].parent_creator).to eq(parent_post.creator)
        expect(post_packs[0].is_parent_updated).to eq(false)
        expect(post_packs[0].is_parent_deleted).to eq(false)
      end

      it 'computes updated posts correctly' do
        parent_post.text = 'This post has been updated.'
        parent_post.save!
        sleep(1) # Realistic wait time + prevents race conditions
        post_packs = answer.compute_post_packs
        expect(post_packs[0].post_id).to eq(parent_post.id)
        expect(post_packs[0].post_updated_at.utc).not_to be_within(0.01.second).of parent_post.updated_at.utc
        expect(post_packs[0].is_post_updated).to eq(true)
        expect(post_packs[0].is_post_deleted).to eq(false)
      end

      it 'computes deleted posts correctly' do
        parent_post.destroy
        sleep(1) # Realistic wait time + prevents race conditions
        post_packs = answer.compute_post_packs
        expect(post_packs[0].post_id).to eq(parent_post.id)
        expect(post_packs[0].is_post_updated).to eq(nil)
        expect(post_packs[0].is_post_deleted).to eq(true)
      end

      it 'computes deleted topics correctly' do
        topic.reload.destroy
        sleep(1) # Realistic wait time + prevents race conditions
        post_packs = answer.compute_post_packs
        expect(post_packs[0].forum_topic_id).to eq(topic.id)
        expect(post_packs[0].post_id).to eq(parent_post.id)
        expect(post_packs[0].is_post_updated).to eq(nil)
        expect(post_packs[0].is_post_deleted).to eq(true)
        expect(post_packs[0].forum_id).to eq(nil)
        expect(post_packs[0].forum_name).to eq(nil)
        expect(post_packs[0].topic_title).to eq(nil)
        expect(post_packs[0].is_topic_deleted).to eq(true)
      end

      it 'computes updated parent posts correctly' do
        parent_post.text = 'This post has been updated.'
        parent_post.save!
        sleep(1) # Realistic wait time + prevents race conditions
        post_packs = answer_with_parent.compute_post_packs
        expect(post_packs[0].post_id).to eq(child_post.id) # Just a simple sanity check for child post
        expect(post_packs[0].parent_updated_at.utc).not_to be_within(0.01.second).of parent_post.updated_at.utc
        expect(post_packs[0].is_parent_updated).to eq(true)
        expect(post_packs[0].is_parent_deleted).to eq(false)
      end

      it 'computes deleted parent posts correctly' do
        parent_post.destroy
        sleep(1) # Realistic wait time + prevents race conditions
        post_packs = answer_with_parent.compute_post_packs
        expect(post_packs[0].post_id).to eq(child_post.id) # Just a simple sanity check for child post
        expect(post_packs[0].is_parent_updated).to eq(nil)
        expect(post_packs[0].is_parent_deleted).to eq(true)
      end
    end
  end
end
