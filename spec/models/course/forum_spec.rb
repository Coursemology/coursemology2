require 'rails_helper'

RSpec.describe Course::Forum, type: :model do
  it { is_expected.to have_many(:topics).inverse_of(:forum).dependent(:destroy) }
  it { is_expected.to have_many(:subscriptions).inverse_of(:forum).dependent(:destroy) }
  it { is_expected.to belong_to(:course).inverse_of(:forums) }

  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:course) { create(:course) }

    describe '#slug_candidates' do
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

    describe '.topic_count' do
      let(:forum) { create(:forum, course: course) }
      let!(:forum_topics) { create_list(:forum_topic, 2, forum: forum) }

      it 'shows the correct count' do
        expect(course.forums.calculated(:topic_count).first.topic_count).to eq(forum_topics.size)
      end
    end

    describe '.topic_post_count' do
      let(:forum) { create(:forum, course: course) }
      let(:first_topic) { create(:forum_topic, forum: forum) }
      let(:second_topic) { create(:forum_topic, forum: forum) }
      let!(:first_topic_posts) { create_list(:post, 2, topic: first_topic.acting_as) }
      let!(:second_topic_posts) { create_list(:post, 1, topic: second_topic.acting_as) }

      it 'shows the correct count' do
        expect(course.forums.calculated(:topic_post_count).first.topic_post_count).
          to eq(first_topic_posts.size + second_topic_posts.size + 2)
      end
    end

    describe '.topic_view_count' do
      let(:forum) { create(:forum, course: course) }
      let(:first_topic) { create(:forum_topic, forum: forum) }
      let(:second_topic) { create(:forum_topic, forum: forum) }
      let!(:first_topic_views) { create_list(:forum_topic_view, 2, topic: first_topic) }
      let!(:second_topic_views) { create_list(:forum_topic_view, 1, topic: second_topic) }

      it 'shows the correct count' do
        expect(course.forums.calculated(:topic_view_count).first.topic_view_count).
          to eq(first_topic_views.size + second_topic_views.size)
      end
    end

    describe '.with_forum_statistics' do
      let(:forum) { create(:forum, course: course) }
      let(:first_topic) { create(:forum_topic, forum: forum) }
      let(:second_topic) { create(:forum_topic, forum: forum) }
      let!(:first_topic_posts) { create_list(:post, 1, topic: first_topic.acting_as) }
      let!(:second_topic_posts) { create_list(:post, 2, topic: second_topic.acting_as) }
      let!(:first_topic_views) { create_list(:forum_topic_view, 2, topic: first_topic) }
      let!(:second_topic_views) { create_list(:forum_topic_view, 1, topic: second_topic) }

      it 'shows the correct count' do
        expect(course.forums.with_forum_statistics.first.topic_count).to eq(2)
        expect(course.forums.with_forum_statistics.first.topic_post_count).
          to eq(first_topic_posts.size + second_topic_posts.size + 2)
        expect(course.forums.with_forum_statistics.first.topic_view_count).
          to eq(first_topic_views.size + second_topic_views.size)
      end
    end
  end
end
