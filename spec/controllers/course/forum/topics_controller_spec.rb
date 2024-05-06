# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Forum::TopicsController, type: :controller do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:user) { create(:administrator) }
    let(:course) { create(:course) }
    let(:forum) { create(:forum, course: course) }
    let(:topic) { create(:forum_topic, forum: forum) }
    let(:topic_stub) do
      stub = create(:forum_topic, forum: forum)
      allow(stub).to receive(:save).and_return(false)
      allow(stub).to receive(:destroy).and_return(false)
      allow(stub).to receive_message_chain(:subscriptions, :create).and_return(false)
      allow(stub).to receive_message_chain(:subscriptions, :where, destroy_all: false)
      stub
    end

    before { controller_sign_in(controller, user) }

    describe '#show' do
      subject { get :show, params: { course_id: course, forum_id: forum, id: topic }, format: :json }

      it 'marks the topic as read' do
        subject
        expect(topic.reload.unread?(user)).to be(false)
      end

      it 'marks the topic posts as read' do
        subject
        expect(topic.reload.posts.any? { |post| post.unread?(user) }).to be(false)
      end
    end

    describe '#destroy' do
      subject { delete :destroy, params: { course_id: course, forum_id: forum, id: topic_stub } }

      context 'when destroy fails' do
        before do
          controller.instance_variable_set(:@topic, topic_stub)
          subject
        end

        it { is_expected.to have_http_status(:bad_request) }
      end
    end

    describe '#subscribe' do
      before do
        controller.instance_variable_set(:@topic, topic_stub)
        subject
      end

      context 'when subscribe fails' do
        subject do
          post :subscribe,
               params: { course_id: course, forum_id: forum, id: topic_stub, subscribe: 'true', format: 'js' }
        end

        it { is_expected.to have_http_status(:bad_request) }
      end

      context 'when unsubscribe fails' do
        subject do
          post :subscribe,
               params: { course_id: course, forum_id: forum, id: topic_stub, subscribe: 'false', format: 'js' }
        end

        it { is_expected.to have_http_status(:bad_request) }
      end
    end

    describe '#locked' do
      before do
        controller.instance_variable_set(:@topic, topic_stub)
        subject
      end

      context 'when set locked fails' do
        subject do
          put :set_locked, params: { course_id: course, forum_id: forum, id: topic_stub, locked: true }
        end

        it { is_expected.to have_http_status(:bad_request) }
      end

      context 'when set unlocked fails' do
        subject do
          put :set_locked, params: { course_id: course, forum_id: forum, id: topic_stub, locked: false }
        end

        it { is_expected.to have_http_status(:bad_request) }
      end
    end

    describe '#hidden' do
      before do
        controller.instance_variable_set(:@topic, topic_stub)
        subject
      end

      context 'when set hidden fails' do
        subject do
          put :set_hidden, params: { course_id: course, forum_id: forum, id: topic_stub, hidden: true }
        end

        it { is_expected.to have_http_status(:bad_request) }
      end

      context 'when set unhidden fails' do
        subject do
          put :set_hidden, params: { course_id: course, forum_id: forum, id: topic_stub, hidden: false }
        end

        it { is_expected.to have_http_status(:bad_request) }
      end
    end
  end
end
