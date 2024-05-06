# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Forum::ForumsController, type: :controller do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:user) { create(:administrator) }
    let(:course) { create(:course) }
    let!(:forum_stub) do
      stub = create(:forum, course: course)
      allow(stub).to receive(:save).and_return(false)
      allow(stub).to receive(:destroy).and_return(false)
      allow(stub).to receive_message_chain(:subscriptions, :create).and_return(false)
      allow(stub).to receive_message_chain(:subscriptions, :where, delete_all: 0).and_return(false)
      stub
    end

    before { controller_sign_in(controller, user) }

    context 'when current user is not enrolled in the course' do
      let(:user) { create(:user) }

      describe '#index' do
        it 'gets access denied' do
          expect { get :index, params: { course_id: course } }.to raise_error(CanCan::AccessDenied)
        end
      end
    end

    describe '#show' do
      let(:forum) { create(:forum, course: course) }
      let!(:topic) { create(:forum_topic, forum: forum) }
      let!(:first_topic_post) { create(:course_discussion_post, topic: topic.acting_as) }
      let!(:second_topic_post) { create(:course_discussion_post, topic: topic.acting_as) }

      it 'preloads the latest and earliest posts for each topics of the forum' do
        get :show, params: { course_id: course, id: forum, format: :json }
        expect(controller.instance_variable_get(:@topics).first.posts.last).
          to eq(second_topic_post)
        expect(controller.instance_variable_get(:@topics).first.posts.first).
          to eq(topic.posts.first)
      end
    end

    describe '#create' do
      subject do
        post :create,
             params: {
               course_id: course,
               forum: { name: 'test', description: '' },
               forum_topics_auto_subscribe: true
             }
      end

      context 'when saving fails' do
        before do
          controller.instance_variable_set(:@forum, forum_stub)
          subject
        end

        it { is_expected.to have_http_status(:bad_request) }
      end
    end

    describe '#update' do
      subject do
        patch :update, params: {
          course_id: course,
          id: forum_stub,
          forum: { name: 'new name', description: 'new description', forum_topics_auto_subscribe: true }
        }
      end

      context 'when update fails' do
        before do
          controller.instance_variable_set(:@forum, forum_stub)
          subject
        end

        it { is_expected.to have_http_status(:bad_request) }
      end
    end

    describe '#destroy' do
      subject { delete :destroy, params: { course_id: course, id: forum_stub } }

      context 'when destroy fails' do
        before do
          controller.instance_variable_set(:@forum, forum_stub)
          subject
        end

        it { is_expected.to have_http_status(:bad_request) }
      end
    end

    describe '#subscribe' do
      subject { post :subscribe, params: { course_id: course, id: forum_stub } }

      context 'when subscribe fails' do
        before do
          controller.instance_variable_set(:@forum, forum_stub)
          subject
        end

        it { is_expected.to have_http_status(:bad_request) }
      end
    end

    describe '#unsubscribe' do
      subject { delete :unsubscribe, params: { course_id: course, id: forum_stub, format: :json } }

      context 'when there is no subscription for the forum' do
        before do
          controller.instance_variable_set(:@forum, forum_stub)
          subject
        end

        it { is_expected.to have_http_status(:bad_request) }
      end
    end

    def check_forum(received_forum_post_pack, expected_forum)
      expect(received_forum_post_pack['course']['id']).to eq(course.id)
      expect(received_forum_post_pack['forum']['id']).to eq(expected_forum.id)
      expect(received_forum_post_pack['forum']['name']).to eq(expected_forum.name)
    end

    # Helper method to check that post pack content is expected
    def check_post_pack(received_post_pack, expected_forum, expected_topic, expected_post, expected_parent = nil) # rubocop:disable Metrics/MethodLength, Metrics/AbcSize
      expect(received_post_pack['corePost']['id']).to eq(expected_post.id)
      expect(received_post_pack['corePost']['text']).to eq(expected_post.text)
      expect(received_post_pack['corePost']['creatorId']).to eq(expected_post.creator.id)
      expect(received_post_pack['corePost']['userName']).to eq(expected_post.creator.name)
      expect(received_post_pack['corePost']['updatedAt'].to_datetime.utc).to \
        be_within(1.second).of expected_post.updated_at.utc
      if expected_parent
        expect(received_post_pack['parentPost']['id']).to eq(expected_parent.id)
        expect(received_post_pack['parentPost']['text']).to eq(expected_parent.text)
        expect(received_post_pack['parentPost']['creatorId']).to eq(expected_parent.creator.id)
        expect(received_post_pack['parentPost']['userName']).to eq(expected_parent.creator.name)
        expect(received_post_pack['parentPost']['updatedAt'].to_datetime.utc).to \
          be_within(1.second).of expected_parent.updated_at.utc
      else
        expect(received_post_pack).not_to include('parentPost')
      end
      expect(received_post_pack['topic']['id']).to eq(expected_topic&.id)
      expect(received_post_pack['topic']['title']).to eq(expected_topic&.title)
      expect(received_post_pack['forum']['id']).to eq(expected_forum&.id)
      expect(received_post_pack['forum']['name']).to eq(expected_forum&.name)
    end

    describe '#all_posts' do
      let(:other_user) { create(:course_student, course: course).user }
      let(:forum) { create(:forum, course: course) }
      let(:topic) { create(:forum_topic, forum: forum) }

      render_views
      subject do
        get :all_posts, as: :json, params: {
          course_id: course
        }
      end

      context 'when there are no posts' do
        it 'returns an empty array' do
          expect(subject).to have_http_status(:success)
          json_result = JSON.parse(response.body)
          expect(json_result['forumTopicPostPacks']).to be_empty
        end
      end

      context 'when there are multiple posts in a single topic' do
        let!(:first_post) { create(:course_discussion_post, topic: topic.acting_as, creator: user) }
        let!(:second_post) { create(:course_discussion_post, topic: topic.acting_as, creator: user) }

        it 'returns all posts in a single topic by current user' do
          expect(subject).to have_http_status(:success)
          json_result = JSON.parse(response.body)
          expect(json_result['forumTopicPostPacks'].count).to eq(1)
          received_forum = json_result['forumTopicPostPacks'][0]
          check_forum(received_forum, forum)
          expect(received_forum['topicPostPacks'].count).to eq(1)
          received_topic = received_forum['topicPostPacks'].first
          expect(received_topic['topic']['id']).to eq(topic.id)
          expect(received_topic['topic']['title']).to eq(topic.title)
          expect(received_topic['postPacks'].count).to eq(2)
          received_first_post = received_topic['postPacks'].find { |pack| pack['corePost']['id'] == first_post.id }
          check_post_pack(received_first_post, forum, topic, first_post)
          received_second_post = received_topic['postPacks'].find { |pack| pack['corePost']['id'] == second_post.id }
          check_post_pack(received_second_post, forum, topic, second_post)
        end
      end

      context 'when there is a parent post' do
        let!(:parent_post) { create(:course_discussion_post, topic: topic.acting_as, creator: other_user) }
        let!(:post) { create(:course_discussion_post, topic: topic.acting_as, parent: parent_post, creator: user) }

        it 'returns parent post information' do
          expect(subject).to have_http_status(:success)
          json_result = JSON.parse(response.body)
          expect(json_result['forumTopicPostPacks'].count).to eq(1)
          received_forum = json_result['forumTopicPostPacks'][0]
          check_forum(received_forum, forum)
          expect(received_forum['topicPostPacks'].count).to eq(1)
          received_topic = received_forum['topicPostPacks'].first
          expect(received_topic['topic']['id']).to eq(topic.id)
          expect(received_topic['topic']['title']).to eq(topic.title)
          expect(received_topic['postPacks'].count).to eq(1)
          received_post = received_topic['postPacks'].first
          check_post_pack(received_post, forum, topic, post, parent_post)
        end
      end

      context 'when there are posts from other users' do
        let!(:other_post) { create(:course_discussion_post, topic: topic.acting_as, creator: other_user) }

        it 'does not return other users\' posts' do
          expect(subject).to have_http_status(:success)
          json_result = JSON.parse(response.body)
          expect(json_result['forumTopicPostPacks']).to be_empty
        end
      end

      context 'when there are multiple topics' do
        let(:second_topic) { create(:forum_topic, forum: forum) }
        let!(:first_topic_post) { create(:course_discussion_post, topic: topic.acting_as, creator: user) }
        let!(:second_topic_post) { create(:course_discussion_post, topic: second_topic.acting_as, creator: user) }

        it 'returns posts across all topics by current user' do
          expect(subject).to have_http_status(:success)
          json_result = JSON.parse(response.body)
          expect(json_result['forumTopicPostPacks'].count).to eq(1)
          received_forum = json_result['forumTopicPostPacks'][0]
          check_forum(received_forum, forum)
          expect(received_forum['topicPostPacks'].count).to eq(2)
          received_first_topic = received_forum['topicPostPacks'].find { |pack| pack['topic']['id'] == topic.id }
          expect(received_first_topic['topic']['id']).to eq(topic.id)
          expect(received_first_topic['topic']['title']).to eq(topic.title)
          expect(received_first_topic['postPacks'].count).to eq(1)
          received_first_topic_post = received_first_topic['postPacks'].first
          check_post_pack(received_first_topic_post, forum, topic, first_topic_post)
          received_second_topic = received_forum['topicPostPacks'].find do |pack|
            pack['topic']['id'] == second_topic.id
          end
          expect(received_second_topic['topic']['id']).to eq(second_topic.id)
          expect(received_second_topic['topic']['title']).to eq(second_topic.title)
          expect(received_second_topic['postPacks'].count).to eq(1)
          received_second_topic_post = received_second_topic['postPacks'].first
          check_post_pack(received_second_topic_post, forum, second_topic, second_topic_post)
        end
      end

      context 'when there are multiple forums' do
        let(:second_forum) { create(:forum, course: course) }
        let(:second_forum_topic) { create(:forum_topic, forum: second_forum) }
        let!(:first_forum_post) { create(:course_discussion_post, topic: topic.acting_as, creator: user) }
        let!(:second_forum_post) { create(:course_discussion_post, topic: second_forum_topic.acting_as, creator: user) }

        it 'returns posts across all forums by current user' do
          expect(subject).to have_http_status(:success)
          json_result = JSON.parse(response.body)
          expect(json_result['forumTopicPostPacks'].count).to eq(2)
          received_first_forum = json_result['forumTopicPostPacks'].find { |pack| pack['forum']['id'] == forum.id }
          check_forum(received_first_forum, forum)
          expect(received_first_forum['topicPostPacks'].count).to eq(1)
          received_first_forum_topic = received_first_forum['topicPostPacks'].first
          expect(received_first_forum_topic['topic']['id']).to eq(topic.id)
          expect(received_first_forum_topic['topic']['title']).to eq(topic.title)
          expect(received_first_forum_topic['postPacks'].count).to eq(1)
          received_first_forum_post = received_first_forum_topic['postPacks'].first
          check_post_pack(received_first_forum_post, forum, topic, first_forum_post)

          received_second_forum = json_result['forumTopicPostPacks'].find do |pack|
            pack['forum']['id'] == second_forum.id
          end
          check_forum(received_second_forum, second_forum)
          expect(received_second_forum['topicPostPacks'].count).to eq(1)
          received_second_forum_topic = received_second_forum['topicPostPacks'].first
          expect(received_second_forum_topic['topic']['id']).to eq(second_forum_topic.id)
          expect(received_second_forum_topic['topic']['title']).to eq(second_forum_topic.title)
          expect(received_second_forum_topic['postPacks'].count).to eq(1)
          received_second_forum_post = received_second_forum_topic['postPacks'].first
          check_post_pack(received_second_forum_post, second_forum, second_forum_topic, second_forum_post)
        end
      end
    end
  end
end
