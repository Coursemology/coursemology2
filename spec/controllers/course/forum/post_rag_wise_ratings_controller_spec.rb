# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Forum::PostRagWiseRatingsController, type: :controller do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:forum) { create(:forum, course: course) }
    let(:topic) { create(:forum_topic, forum: forum) }
    let(:post) { create(:course_discussion_post, topic: topic.acting_as, is_ai_generated: true) }
    let!(:rating) { create(:course_forum_rag_wise_rating, post: post) }

    before { controller_sign_in(controller, user) }

    subject do
      patch :update, params: { course_id: course, forum_id: forum, topic_id: topic, id: post.id, rating: 4 }
    end

    context 'when the user is course staff' do
      let(:user) { create(:course_teaching_assistant, course: course).user }

      it 'sets the numeric rating without capturing edited content yet' do
        expect(subject).to have_http_status(:ok)
        rating.reload
        expect(rating.rating).to eq(4)
        expect(rating.updater).to eq(user)
        # Edited content is captured from the post lifecycle (publish/reject), not this endpoint.
        expect(rating.edited_content).to be_nil
      end
    end

    context 'when the user is a student' do
      let(:user) { create(:course_student, course: course).user }

      it 'is forbidden and does not change the rating' do
        expect { subject }.to raise_error(CanCan::AccessDenied)
        expect(rating.reload.rating).to be_nil
      end
    end
  end
end
