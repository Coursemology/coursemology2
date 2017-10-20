# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Discussion::PostsController do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:user) { create(:user) }
    let(:course) { create(:course, creator: user) }
    let(:topic) do
      create(:course_assessment_submission_question, course: course, user: user).acting_as
    end
    let(:immutable_post) do
      create(:course_discussion_post, topic: topic, creator: user, updater: user).tap do |stub|
        allow(stub).to receive(:update_attributes).and_return(false)
      end
    end

    before { sign_in(user) }

    describe '#update' do
      let(:post_text) { 'updated post text' }

      subject do
        post :update, as: :js, params: {
          course_id: course, topic_id: topic,
          id: immutable_post, discussion_post: { text: post_text }
        }
      end

      context 'when updating fails' do
        before do
          controller.instance_variable_set(:@post, immutable_post)
          subject
        end

        it 'returns HTTP 400' do
          expect(response.status).to eq(400)
        end
      end
    end
  end
end
