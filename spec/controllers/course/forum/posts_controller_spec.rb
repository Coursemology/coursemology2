# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Forum::PostsController, type: :controller do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:user) { create(:administrator) }
    let(:course) { create(:course) }
    let(:forum) { create(:forum, course: course) }

    before { sign_in(user) }

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

        it { is_expected.to redirect_to(course_forum_topic_path(course, forum, topic)) }
        it 'sets an error flash message' do
          expect(flash[:danger]).to eq(I18n.t('course.discussion.posts.destroy.failure',
                                              error: post.errors.full_messages.to_sentence))
        end
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

    describe '#edit' do
      subject do
        get :edit,
            params: { course_id: course, forum_id: forum, topic_id: topic, id: post.id }
      end

      context 'when edit page is loaded' do
        let!(:topic) do
          topic = create(:forum_topic, forum: forum)
          create(:course_discussion_post, topic: topic.acting_as)
          topic
        end
        let!(:post) do
          # Bypass before_save callback which strips `script` tags.
          topic.posts.first.update_column(:text, "<script>alert('boo');</script>")
          topic.posts.first
        end

        it 'sanitizes the post text' do
          subject
          expect(assigns(:post).text).not_to include('script')
        end
      end
    end
  end
end
