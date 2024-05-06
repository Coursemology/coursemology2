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
    let(:immutable_update_post) do
      create(:course_discussion_post, topic: topic, creator: user, updater: user).tap do |stub|
        allow(stub).to receive(:update).and_return(false)
      end
    end
    let(:immutable_destroy_post) do
      create(:course_discussion_post, topic: topic, creator: user, updater: user).tap do |stub|
        allow(stub).to receive(:destroy).and_return(false)
      end
    end

    before { controller_sign_in(controller, user) }

    describe '#update' do
      let(:post_text) { 'updated post text' }

      subject do
        post :update, as: :json, params: {
          course_id: course, topic_id: topic,
          id: immutable_update_post, discussion_post: { text: post_text }
        }
      end

      context 'when updating is successful' do
        before do
          subject
        end

        it 'returns HTTP 200' do
          expect(immutable_update_post.reload.text).to eq('updated post text')
          expect(response.status).to eq(200)
        end
      end

      context 'when updating fails' do
        before do
          controller.instance_variable_set(:@post, immutable_update_post)
          subject
        end

        it 'returns HTTP 400' do
          expect(response.status).to eq(400)
        end
      end
    end

    describe '#destroy' do
      subject do
        post :destroy, params: {
          course_id: course, topic_id: topic,
          id: immutable_destroy_post
        }
      end

      context 'when destroying is successful' do
        before do
          subject
        end

        it 'returns HTTP 200' do
          expect(response.status).to eq(200)
        end
      end

      context 'when destroying fails' do
        before do
          controller.instance_variable_set(:@post, immutable_destroy_post)
          subject
        end

        it 'returns HTTP 400' do
          expect(response.status).to eq(400)
        end
      end
    end
  end
end
