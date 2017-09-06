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
      allow(stub.subscriptions).to receive(:create).and_return(false)
      allow(stub.subscriptions).to receive_message_chain(:where, destroy_all: false)
      stub
    end

    before { sign_in(user) }

    describe '#show' do
      subject { get :show, course_id: course, forum_id: forum, id: topic }

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
      subject { delete :destroy, course_id: course, forum_id: forum, id: topic_stub }

      context 'when destroy fails' do
        before do
          controller.instance_variable_set(:@topic, topic_stub)
          subject
        end

        it { is_expected.to redirect_to(course_forum_topic_path(course, forum, topic_stub)) }
        it 'sets an error flash message' do
          expect(flash[:danger]).to eq(I18n.t('course.forum.topics.destroy.failure',
                                              error: topic_stub.errors.full_messages.to_sentence))
        end
      end
    end

    describe '#subscribe' do
      before do
        controller.instance_variable_set(:@topic, topic_stub)
        subject
      end

      context 'when subscribe fails' do
        subject do
          post :subscribe, course_id: course, forum_id: forum, id: topic_stub, subscribe: 'true'
        end

        it { is_expected.to redirect_to(course_forum_topic_path(course, forum, topic_stub)) }
        it 'sets an error flash message' do
          expect(flash[:danger]).to eq(I18n.t('course.forum.topics.subscribe.failure'))
        end
      end

      context 'when unsubscribe fails' do
        subject do
          post :subscribe, course_id: course, forum_id: forum, id: topic_stub, subscribe: 'false'
        end

        it { is_expected.to redirect_to(course_forum_topic_path(course, forum, topic_stub)) }
        it 'sets an error flash message' do
          expect(flash[:danger]).to eq(I18n.t('course.forum.topics.unsubscribe.failure'))
        end
      end
    end

    describe '#locked' do
      before do
        controller.instance_variable_set(:@topic, topic_stub)
        subject
      end

      context 'when set locked fails' do
        subject do
          put :set_locked, course_id: course, forum_id: forum, id: topic_stub, locked: true
        end

        it { is_expected.to redirect_to(course_forum_topic_path(course, forum, topic_stub)) }
        it 'sets an error flash message' do
          expect(flash[:danger]).to eq(I18n.t('course.forum.topics.locked.failure'))
        end
      end

      context 'when set unlocked fails' do
        subject do
          put :set_locked, course_id: course, forum_id: forum, id: topic_stub, locked: false
        end

        it { is_expected.to redirect_to(course_forum_topic_path(course, forum, topic_stub)) }
        it 'sets an error flash message' do
          expect(flash[:danger]).to eq(I18n.t('course.forum.topics.unlocked.failure'))
        end
      end
    end

    describe '#hidden' do
      before do
        controller.instance_variable_set(:@topic, topic_stub)
        subject
      end

      context 'when set hidden fails' do
        subject do
          put :set_hidden, course_id: course, forum_id: forum, id: topic_stub, hidden: true
        end

        it { is_expected.to redirect_to(course_forum_topic_path(course, forum, topic_stub)) }
        it 'sets an error flash message' do
          expect(flash[:danger]).to eq(I18n.t('course.forum.topics.hidden.failure'))
        end
      end

      context 'when set unhidden fails' do
        subject do
          put :set_hidden, course_id: course, forum_id: forum, id: topic_stub, hidden: false
        end

        it { is_expected.to redirect_to(course_forum_topic_path(course, forum, topic_stub)) }
        it 'sets an error flash message' do
          expect(flash[:danger]).to eq(I18n.t('course.forum.topics.unhidden.failure'))
        end
      end
    end

    describe '#resolved' do
      before do
        controller.instance_variable_set(:@topic, topic_stub)
        subject
      end

      context 'when set resolved fails' do
        subject do
          put :set_resolved, course_id: course, forum_id: forum, id: topic_stub, resolved: true
        end

        it { is_expected.to redirect_to(course_forum_topic_path(course, forum, topic_stub)) }
        it 'sets an error flash message' do
          expect(flash[:danger]).to eq(I18n.t('course.forum.topics.resolved.failure'))
        end
      end

      context 'when set unresolved fails' do
        subject do
          put :set_resolved, course_id: course, forum_id: forum, id: topic_stub, resolved: false
        end

        it { is_expected.to redirect_to(course_forum_topic_path(course, forum, topic_stub)) }
        it 'sets an error flash message' do
          expect(flash[:danger]).to eq(I18n.t('course.forum.topics.unresolved.failure'))
        end
      end
    end
  end
end
