require 'rails_helper'

RSpec.describe Course::Forum::Topic, type: :model do
  it { is_expected.to act_as(:topic).class_name(Course::Discussion::Topic.name) }
  it { is_expected.to have_many(:views).inverse_of(:topic).dependent(:destroy) }
  it { is_expected.to belong_to(:forum).inverse_of(:topics) }
  it { is_expected.to belong_to(:creator) }

  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:forum) { create(:forum) }

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
          expect(topic.posts.first.title).to eq('lol')
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
          expect(topic.posts.first.title).to eq('lol')
        end
      end
    end

    describe '.post_count' do
      let(:topic) { create(:forum_topic, forum: forum) }
      let!(:topic_posts) { create_list(:post, 2, topic: topic.acting_as) }

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

    describe '.with_latest_post' do
      let(:topic) { create(:forum_topic, forum: forum) }
      let!(:first_topic_post) { create(:post, topic: topic.acting_as) }
      let!(:second_topic_post) { create(:post, topic: topic.acting_as) }

      it 'preloads the latest post' do
        expect(forum.topics.with_latest_post.first.posts.first).to eq(second_topic_post)
      end
    end
  end
end
