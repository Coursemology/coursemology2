# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Forum::PostsController, type: :controller do
  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:user) { create(:administrator) }
    let(:course) { create(:course) }
    let(:forum) { create(:forum, course: course) }
    let(:topic) { create(:forum_topic, forum: forum) }
    let!(:post_stub) do
      stub = build_stubbed(:post, topic: topic.acting_as)
      allow(stub).to receive(:destroy).and_return(false)
      stub
    end

    before { sign_in(user) }

    describe '#destroy' do
      subject do
        delete :destroy, course_id: course, forum_id: forum, topic_id: topic, id: post_stub
      end

      context 'when destroy fails' do
        before do
          controller.instance_variable_set(:@post, post_stub)
          subject
        end

        it 'redirects with a flash message' do
          it { is_expected.to redirect_to(course_forum_topic_path(current_course, forum, topic)) }
          expect(flash[:danger]).to eq(I18n.t('course.discussion.posts.destroy.failure',
                                              error: post_stub.errors.full_messages.to_sentence))
        end
      end
    end
  end
end
