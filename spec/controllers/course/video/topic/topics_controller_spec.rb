# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Video::TopicsController do
  let!(:instance) { create(:instance, :with_video_component_enabled) }

  with_tenant(:instance) do
    let(:user) { create(:user) }
    let!(:course) { create(:course, :with_video_component_enabled, creator: user) }
    let(:video) { create(:video, :published, course: course) }

    before { sign_in(user) }

    describe '#create' do
      let(:topic_id) { nil }

      subject do
        post :create, as: :json, params: {
          course_id: course, video_id: video,
          timestamp: 5,
          discussion_post: {
            text: comment,
            topic_id: topic_id
          }
        }
      end

      context 'when create fails' do
        let(:comment) { nil }

        it 'returns HTTP 400' do
          subject
          expect(response.status).to eq(400)
        end
      end

      context 'when create succeeds' do
        let(:comment) { 'new comment' }

        it 'returns HTTP 200' do
          subject
          expect(response.status).to eq(200)
        end

        it 'adds a new comment' do
          expect { subject }.to change(Course::Discussion::Post, :count).by(1)
        end

        it 'adds a new topic' do
          expect { subject }.to change(Course::Video::Topic, :count).by(1)
        end

        context 'when existing topic is provided' do
          let(:root_post) { build(:course_discussion_post) }
          let(:child_post) { build(:course_discussion_post, parent: root_post) }
          let(:posts) { [root_post, child_post] }
          let!(:topic) do
            create(:video_topic, course: course, video: video, creator: user, posts: posts)
          end
          let(:topic_id) { topic.id }

          it 'does not create a new topic' do
            expect { subject }.to change(Course::Video::Topic, :count).by(0)
          end

          it 'creates only one new post' do
            expect { subject }.to change(Course::Discussion::Post, :count).by(1)
          end

          it 'creates a post under the last child post' do
            expect { subject }.to change(child_post.children, :count).by(1)
          end
        end
      end
    end
  end
end
