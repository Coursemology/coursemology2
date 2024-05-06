# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Forum::PostsController, type: :controller do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:user) { create(:administrator) }
    let(:course) { create(:course) }
    let(:forum) { create(:forum, course: course) }

    before { controller_sign_in(controller, user) }

    describe '#destroy' do
      subject do
        delete :destroy,
               params: { course_id: course, forum_id: forum, topic_id: topic, id: post.id }
      end

      context 'when destroy fails' do
        let(:topic) do
          topic = create(:forum_topic, forum: forum)
          create(:course_discussion_post, topic: topic.acting_as)
          topic
        end
        let!(:post) do
          stub = build_stubbed(:course_discussion_post, topic: topic.acting_as)
          allow(stub).to receive(:destroy).and_return(false)
          stub
        end
        before do
          controller.instance_variable_set(:@post, post)
          subject
        end

        it { is_expected.to have_http_status(:bad_request) }
      end

      context 'when the only post in the topic is deleted' do
        let(:topic) { create(:forum_topic, forum: forum) }
        let(:post) { topic.posts.first }
        before { subject }

        it 'destroys the topic' do
          expect(forum.topics).to be_empty
        end
      end
    end
  end
end
