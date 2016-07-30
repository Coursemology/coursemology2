# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Discussion::PostsController do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:user) { create(:user) }
    let(:course) { create(:course, creator: user) }
    let(:topic) { create(:course_assessment_answer, course: course).acting_as }
    let(:immutable_post) do
      create(:course_discussion_post, topic: topic, creator: user, updater: user).tap do |stub|
        allow(stub).to receive(:update_attributes).and_return(false)
      end
    end

    before { sign_in(user) }

    describe '#update' do
      let(:post_text) { 'updated post text' }

      subject do
        post :update, format: :js, course_id: course, topic_id: topic,
                      id: immutable_post, discussion_post: { text: post_text }
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
