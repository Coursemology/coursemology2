require 'rails_helper'

RSpec.describe Course::Discussion::PostsController, type: :controller do
  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:user) { create(:administrator) }
    let(:forum_topic)  { create(:forum_topic).topic }
    let!(:post_stub) do
      stub = create(:post)
      allow(stub).to receive(:save).and_return(false)
      allow(stub).to receive(:destroy).and_return(false)
      stub
    end

    controller(Course::Discussion::PostsController) do
      def topic
        Course::Forum::Topic.last.topic
      end

      def default_return_path
        '/default'
      end

      def destroy_success_path
        '/destroy_success'
      end

      def create_success_path
        '/create_success'
      end

      def auto_subscribe_topic
        return false unless @topic.subscriptions.where(user: current_user).empty?
        @topic.subscriptions.build(user: current_user).save
      end
    end

    before { sign_in(user) }

    describe 'default behaviours' do
      controller(Course::Discussion::PostsController) do
      end

      describe '#default_return_path' do
        it { expect { controller.send(:default_return_path) }.to raise_error(NotImplementedError) }
      end

      describe '#topic' do
        it { expect { controller.send(:topic) }.to raise_error(NotImplementedError) }
      end

      describe '#auto_subscribe_topic' do
        it { expect { controller.send(:auto_subscribe_topic) }.to raise_error(NotImplementedError) }
      end
    end

    describe '#create' do
      subject do
        post :create, discussion_post: { title: 'test', text: '' }
      end

      context 'when saving succeeds' do
        before do
          create(:forum_topic)
          subject
        end

        it { expect(Course::Forum::Topic.last.topic.posts.count).to eq(2) }
        it { expect(Course::Forum::Topic.last.topic.subscriptions.count).to eq(1) }
        it { is_expected.to redirect_to('/create_success') }
      end

      context 'when saving fails' do
        before do
          allow(controller).to receive(:create_post).and_return(false)
          subject
        end

        it { is_expected.to redirect_to('/default') }
      end
    end

    describe '#update' do
      let!(:topic_post) { create(:post, topic: forum_topic) }

      subject do
        patch :update,
              id: topic_post,
              discussion_post: { title: 'new title', text: 'new text' }
      end

      context 'when update succeeds' do
        before { subject }

        it { expect(topic_post.reload.title).to eq('new title') }
        it { expect(topic_post.reload.text).to eq('new text') }
        it { is_expected.to redirect_to('/default') }
      end

      context 'when update fails' do
        before do
          controller.instance_variable_set(:@post, post_stub)
          subject
        end

        it { is_expected.to redirect_to('/default') }
      end
    end

    describe '#destroy' do
      let!(:topic_post) { create(:post, topic: forum_topic) }

      subject { delete :destroy, id: topic_post }

      context 'when destroy succeeds' do
        before { subject }

        it { expect(forum_topic.posts.count).to eq(1) }
        it { is_expected.to redirect_to('/destroy_success') }
      end

      context 'when destroy fails' do
        before do
          controller.instance_variable_set(:@post, post_stub)
          subject
        end

        it { is_expected.to redirect_to('/default') }
      end
    end
  end
end
