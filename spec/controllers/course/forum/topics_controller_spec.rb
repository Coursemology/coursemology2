require 'rails_helper'

RSpec.describe Course::Forum::TopicsController, type: :controller do
  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:user) { create(:administrator) }
    let(:course) { create(:course) }
    let(:forum) { create(:forum, course: course) }
    let!(:topic_stub) do
      stub = create(:forum_topic, forum: forum)
      allow(stub).to receive(:save).and_return(false)
      allow(stub).to receive(:destroy).and_return(false)
      allow(stub.subscriptions).to receive(:create).and_return(false)
      allow(stub.subscriptions).to receive_message_chain(:where, destroy_all: false)
      stub
    end

    before { sign_in(user) }

    describe '#destroy' do
      subject { delete :destroy, course_id: course, forum_id: forum, id: topic_stub }

      context 'when destroy fails' do
        before do
          controller.instance_variable_set(:@topic, topic_stub)
          subject
        end

        it { is_expected.to redirect_to(course_forum_topic_path(course, forum, topic_stub)) }
      end
    end

    describe '#subscribe' do
      subject { post :subscribe, course_id: course, forum_id: forum, id: topic_stub }

      context 'when subscribe fails' do
        before do
          controller.instance_variable_set(:@topic, topic_stub)
          subject
        end

        it { is_expected.to redirect_to(course_forum_topic_path(course, forum, topic_stub)) }
      end
    end

    describe '#unsubscribe' do
      subject { delete :unsubscribe, course_id: course, forum_id: forum, id: topic_stub }

      context 'when unsubscribe fails' do
        before do
          controller.instance_variable_set(:@topic, topic_stub)
          subject
        end

        it { is_expected.to redirect_to(course_forum_topic_path(course, forum, topic_stub)) }
      end
    end

    describe '#locked' do
      subject { put :set_locked, course_id: course, forum_id: forum, id: topic_stub, option: true }

      context 'when set locked fails' do
        before do
          controller.instance_variable_set(:@topic, topic_stub)
          subject
        end

        it { is_expected.to redirect_to(course_forum_topic_path(course, forum, topic_stub)) }
      end
    end

    describe '#hidden' do
      subject { put :set_hidden, course_id: course, forum_id: forum, id: topic_stub, option: true }

      context 'when set hidden fails' do
        before do
          controller.instance_variable_set(:@topic, topic_stub)
          subject
        end

        it { is_expected.to redirect_to(course_forum_topic_path(course, forum, topic_stub)) }
      end
    end
  end
end
