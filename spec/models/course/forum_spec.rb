require 'rails_helper'

RSpec.describe Course::Forum, type: :model do
  it { is_expected.to have_many(:topics).inverse_of(:forum).dependent(:destroy) }
  it { is_expected.to have_many(:subscriptions).inverse_of(:forum).dependent(:destroy) }
  it { is_expected.to belong_to(:course).inverse_of(:forums) }

  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    describe '#slug_candidates' do
      let(:course) { create(:course) }
      let!(:first_forum) { create(:forum, name: 'slug', course: course) }
      let!(:second_forum) { create(:forum, name: 'slug', course: course) }

      context 'when name is unique' do
        it 'generates a slug based on the name' do
          expect(first_forum.slug).to eq('slug')
        end
      end

      context 'when name is not unique but course id is unique' do
        it 'generates a slug based on name and course_id' do
          expect(second_forum.slug).to eq("slug-#{course.id}")
        end
      end
    end

    describe '.with_topic_count' do
      let(:forum) { create(:forum) }
      let!(:forum_topics) { create_list(:forum_topic, 2, forum: forum) }

      it 'shows the correct count' do
        expect(Course::Forum.with_topic_count.find(forum.id).topic_count).
          to eq(forum_topics.size)
      end
    end

    describe '.with_topic_post_count' do
      let(:forum) { create(:forum) }
      let(:first_topic) { create(:forum_topic, forum: forum) }
      let(:second_topic) { create(:forum_topic, forum: forum) }
      let!(:first_topic_posts) { create_list(:post, 2, topic: first_topic.acting_as) }
      let!(:second_topic_posts) { create_list(:post, 1, topic: second_topic.acting_as) }

      it 'shows the correct count' do
        expect(Course::Forum.with_topic_post_count.find(forum.id).topic_post_count).
          to eq(first_topic_posts.size + second_topic_posts.size)
      end
    end

    describe '.with_topic_view_count' do
      let(:forum) { create(:forum) }
      let(:first_topic) { create(:forum_topic, forum: forum) }
      let(:second_topic) { create(:forum_topic, forum: forum) }
      let!(:first_topic_views) { create_list(:forum_topic_view, 2, topic: first_topic) }
      let!(:second_topic_views) { create_list(:forum_topic_view, 1, topic: second_topic) }

      it 'shows the correct count' do
        expect(Course::Forum.with_topic_view_count.find(forum.id).topic_view_count).
          to eq(first_topic_views.size + second_topic_views.size)
      end
    end

    describe '.with_forum_statistics' do
      let(:forum) { create(:forum) }
      let(:first_topic) { create(:forum_topic, forum: forum) }
      let(:second_topic) { create(:forum_topic, forum: forum) }
      let!(:first_topic_posts) { create_list(:post, 1, topic: first_topic.acting_as) }
      let!(:second_topic_posts) { create_list(:post, 2, topic: second_topic.acting_as) }
      let!(:first_topic_views) { create_list(:forum_topic_view, 2, topic: first_topic) }
      let!(:second_topic_views) { create_list(:forum_topic_view, 1, topic: second_topic) }

      it 'shows the correct count' do
        expect(Course::Forum.with_forum_statistics.find(forum.id).topic_count).
          to eq(2)
        expect(Course::Forum.with_forum_statistics.find(forum.id).topic_post_count).
          to eq(first_topic_posts.size + second_topic_posts.size)
        expect(Course::Forum.with_forum_statistics.find(forum.id).topic_view_count).
          to eq(first_topic_views.size + second_topic_views.size)
      end
    end
  end
end
