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
      allow(stub).to receive_message_chain(:subscriptions, :where, delete_all: 0)
      stub
    end

    before { sign_in(user) }

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

      it 'preloads the latest post for each topics of the forum' do
        get :show, params: { course_id: course, id: forum }
        expect(controller.instance_variable_get(:@topics).first.posts.first).
          to eq(second_topic_post)
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

        it { is_expected.to render_template('new') }
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

        it { is_expected.to render_template('edit') }
      end
    end

    describe '#destroy' do
      subject { delete :destroy, params: { course_id: course, id: forum_stub } }

      context 'when destroy fails' do
        before do
          controller.instance_variable_set(:@forum, forum_stub)
          subject
        end

        it { is_expected.to redirect_to(course_forum_path(course, forum_stub)) }
      end
    end

    describe '#subscribe' do
      subject { post :subscribe, params: { course_id: course, id: forum_stub, format: 'js' } }

      context 'when subscribe fails' do
        before do
          controller.instance_variable_set(:@forum, forum_stub)
          subject
        end

        it 'sets a failure flash message' do
          expect(flash.now[:danger]).to eq(I18n.t('course.forum.forums.subscribe.failure'))
        end
      end
    end

    describe '#unsubscribe' do
      subject { delete :unsubscribe, params: { course_id: course, id: forum_stub, format: 'js' } }

      context 'when there is no subscription for the forum' do
        before do
          controller.instance_variable_set(:@forum, forum_stub)
          subject
        end

        it 'sets a failure flash message' do
          expect(flash.now[:danger]).to eq(I18n.t('course.forum.forums.unsubscribe.failure'))
        end
      end
    end
  end
end
