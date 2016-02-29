# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Forum::ForumsController, type: :controller do
  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:user) { create(:administrator) }
    let(:course) { create(:course) }
    let!(:forum_stub) do
      stub = create(:forum, course: course)
      allow(stub).to receive(:save).and_return(false)
      allow(stub).to receive(:destroy).and_return(false)
      allow(stub.subscriptions).to receive(:create).and_return(false)
      allow(stub.subscriptions).to receive_message_chain(:where, delete_all: false)
      stub
    end

    before { sign_in(user) }

    describe '#show' do
      let(:forum) { create(:forum, course: course) }
      let!(:topic) { create(:forum_topic, forum: forum) }
      let!(:first_topic_post) { create(:course_discussion_post, topic: topic.acting_as) }
      let!(:second_topic_post) { create(:course_discussion_post, topic: topic.acting_as) }

      it 'preloads the latest post for each topics of the forum' do
        get :show, course_id: course, id: forum
        expect(controller.instance_variable_get(:@topics).first.posts.first).
          to eq(second_topic_post)
      end
    end

    describe '#create' do
      subject do
        post :create,
             course_id: course,
             forum: { name: 'test', description: '' }
      end

      context 'when saving fails' do
        before do
          controller.instance_variable_set(:@forum, forum_stub)
          subject
        end

        it { is_expected.to render_template('new') }
      end
    end

    describe '#update' do
      subject do
        patch :update,
              course_id: course,
              id: forum_stub,
              forum: { name: 'new name', descripiton: 'new description' }
      end

      context 'when update fails' do
        before do
          controller.instance_variable_set(:@forum, forum_stub)
          subject
        end

        it { is_expected.to render_template('edit') }
      end
    end

    describe '#destroy' do
      subject { delete :destroy, course_id: course, id: forum_stub }

      context 'when destroy fails' do
        before do
          controller.instance_variable_set(:@forum, forum_stub)
          subject
        end

        it { is_expected.to redirect_to(course_forum_path(course, forum_stub)) }
      end
    end

    describe '#subscribe' do
      subject { post :subscribe, course_id: course, id: forum_stub }

      context 'when subscribe fails' do
        before do
          controller.instance_variable_set(:@forum, forum_stub)
          subject
        end

        it { is_expected.to redirect_to(course_forum_path(course, forum_stub)) }
      end
    end

    describe '#unsubscribe' do
      subject { delete :unsubscribe, course_id: course, id: forum_stub }

      context 'when unsubscribe fails' do
        before do
          controller.instance_variable_set(:@forum, forum_stub)
          subject
        end

        it { is_expected.to redirect_to(course_forum_path(course, forum_stub)) }
      end
    end
  end
end
