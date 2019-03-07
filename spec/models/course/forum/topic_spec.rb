# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Forum::Topic, type: :model do
  it { is_expected.to act_as(Course::Discussion::Topic) }
  it { is_expected.to have_many(:views).inverse_of(:topic).dependent(:destroy) }
  it { is_expected.to belong_to(:forum).inverse_of(:topics) }

  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:forum) { create(:forum) }

    describe '.filter_unresolved_forum' do
      let!(:topic) { create(:forum_topic, forum: forum, topic_type: :question) }

      it 'returns the unresolved forum in the collection' do
        expect(Course::Forum::Topic.filter_unresolved_forum([])).to be_empty
        expect(Course::Forum::Topic.filter_unresolved_forum([forum.id])).to contain_exactly(forum.id)
      end
    end

    describe '#slug_candidates' do
      let!(:first_topic) { create(:forum_topic, title: 'slug', forum: forum) }
      let!(:second_topic) { create(:forum_topic, title: 'slug', forum: forum) }

      context 'when title is unique' do
        it 'generates a slug based on the title' do
          expect(first_topic.slug).to eq('slug')
        end
      end

      context 'when title is not unique but forum id is unique' do
        it 'generates a slug based on title and forum_id' do
          expect(second_topic.slug).to eq("slug-#{forum.id}")
        end
      end
    end

    describe '#generate_initial_post' do
      let!(:topic) { create(:forum_topic, forum: forum, title: 'lol') }

      context 'when creating a new topic' do
        it 'generates an initial post with the same title as the topic' do
          expect(topic.posts.count).to eq(1)
        end
      end

      context 'when reinitializing a topic' do
        subject do
          test_topic = Course::Forum::Topic.new(posts_attributes: [title: nil])
          test_topic.save
          test_topic
        end

        it 'does not create another post' do
          expect(subject.posts.size).to eq(1)
        end
      end

      context 'when updating a topic' do
        before do
          topic.update_attribute(:title, 'new title')
          topic.save
        end

        it 'does not change the number of posts and the title of the initial post' do
          expect(topic.posts.count).to eq(1)
          expect(topic.title).to eq('new title')
        end
      end
    end

    describe '.vote_count' do
      let(:topic) { create(:forum_topic, forum: forum) }
      let!(:votes) do
        create_list(:course_discussion_post_vote, vote_count, post: topic.posts.first)
      end
      let(:vote_count) { 3 }

      it 'sets calculates correct vote_count' do
        expect(forum.topics.calculated(:vote_count).first.vote_count).to eq(vote_count)
      end
    end

    describe '.post_count' do
      let(:topic) { create(:forum_topic, forum: forum) }
      let!(:topic_posts) { create_list(:course_discussion_post, 2, topic: topic.acting_as) }

      it 'preloads the correct post count' do
        expect(forum.topics.calculated(:post_count).first.post_count).to eq(topic_posts.size + 1)
      end
    end

    describe '.view_count' do
      let(:topic) { create(:forum_topic, forum: forum) }
      let!(:topic_views) { create_list(:forum_topic_view, 2, topic: topic) }

      it 'preloads the correct view count' do
        expect(forum.topics.calculated(:view_count).first.view_count).to eq(topic_views.size)
      end
    end

    describe '.order_by_latest_post' do
      let!(:topics) { create_list(:forum_topic, topic_count, forum: forum) }
      let(:topic_count) { 3 }

      it 'sorts by updated date' do
        expect(topics).not_to be_empty
        consecutive = forum.topics.order_by_latest_post.each_cons(2)
        expect(consecutive.all? { |first, second| first.latest_post_at <= second.latest_post_at })
      end
    end

    describe '.topic_unread_count' do
      let!(:user) { create(:user) }
      let!(:topics) { create_list(:forum_topic, 3, forum: forum) }

      it 'returns the unread count of the user' do
        expect(forum.topic_unread_count(user)).to eq(topics.size)
      end

      context 'when user have read the topic' do
        before { topics.sample.mark_as_read!(for: user) }

        it 'returns the unread count of the user' do
          expect(forum.topic_unread_count(user)).to eq(topics.size - 1)
        end
      end
    end

    describe '.with_latest_post' do
      let(:topic) { create(:forum_topic, forum: forum) }
      let!(:first_topic_post) { create(:course_discussion_post, topic: topic.acting_as) }
      let!(:second_topic_post) { create(:course_discussion_post, topic: topic.acting_as) }

      it 'preloads the latest post' do
        expect(forum.topics.with_latest_post.first.posts.first).to eq(second_topic_post)
      end
    end

    describe '.with_topic_statistics' do
      let(:topic) { create(:forum_topic, forum: forum) }
      let!(:topic_posts) { create_list(:course_discussion_post, 2, topic: topic.acting_as) }
      let!(:topic_views) { create_list(:forum_topic_view, 2, topic: topic) }

      it 'preloads the correct post and view count' do
        expect(forum.topics.with_topic_statistics.first.post_count).to eq(topic_posts.size + 1)
        expect(forum.topics.with_topic_statistics.first.view_count).to eq(topic_views.size)
      end
    end

    describe '.from_course' do
      let(:topic_count) { Random.rand(3) }
      let!(:topics) { create_list(:forum_topic, topic_count, forum: forum) }

      subject { Course::Forum::Topic.from_course(forum.course) }

      it { is_expected.to contain_exactly(*topics) }
    end

    describe 'unread' do
      let(:topic) { create(:forum_topic) }
      context 'after topic was created' do
        it 'has been read by the creator' do
          expect(topic.creator.have_read?(topic)).to be_truthy
        end
      end

      context 'after topic was updated' do
        it 'has been read by the updater' do
          topic.update_attributes(title: 'New Topic')
          expect(topic.updater.have_read?(topic)).to be_truthy
        end
      end
    end
  end
end
