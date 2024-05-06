# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Submission::Answer::ForumPostResponse::PostsController do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:user) { create(:user) }
    let(:course) { create(:course, creator: user) }
    let(:assessment) { create(:assessment, :with_forum_post_response_question, course: course) }
    let(:submission) { create(:submission, :submitted, assessment: assessment, creator: user) }
    let(:answer) { submission.answers.first }
    let(:topic) { create(:forum_topic, course: course) }
    let(:parent_post) { create(:course_discussion_post, topic: topic.acting_as) }
    let(:forum_post) { create(:course_discussion_post, topic: topic.acting_as, parent: parent_post) }
    let!(:post_pack) do
      create(:course_assessment_answer_forum_post, parent: parent_post, topic: topic.acting_as,
                                                   post: forum_post, answer: answer.actable)
    end

    before do
      controller_sign_in(controller, user)
    end

    describe '#selected' do
      render_views
      subject do
        get :selected, as: :json, params: {
          course_id: course, assessment_id: assessment.id, submission_id: submission.id,
          answer_id: answer.id
        }
      end

      it 'returns the posts correctly' do
        expect(subject).to have_http_status(:success)
        json_result = JSON.parse(response.body)
        expect(json_result['selected_post_packs'].count).to eq(1)

        received_post = json_result['selected_post_packs'].first
        expect(received_post['forum']['id']).to eq(topic.forum.id)
        expect(received_post['forum']['name']).to eq(topic.forum.name)
        expect(received_post['topic']['id']).to eq(topic.id)
        expect(received_post['topic']['title']).to eq(topic.title)
        expect(received_post['topic']['isDeleted']).to eq(false)

        # The forum_post here is a post pack, so there is one level of indirection
        expect(received_post['corePost']['id']).to eq(forum_post.id)
        expect(received_post['corePost']['text']).to eq(forum_post.text)
        expect(received_post['corePost']['creatorId']).to eq(forum_post.creator.id)
        expect(received_post['corePost']['userName']).to eq(forum_post.creator.name)
        expect(received_post['corePost']['updatedAt'].to_datetime.utc).to \
          be_within(1.second).of forum_post.updated_at.utc
        expect(received_post['corePost']['isUpdated']).to eq(false)
        expect(received_post['corePost']['isDeleted']).to eq(false)

        # Whereas the parent_post here is the raw post
        expect(received_post['parentPost']['id']).to eq(parent_post.id)
        expect(received_post['parentPost']['text']).to eq(parent_post.text)
        expect(received_post['parentPost']['creatorId']).to eq(parent_post.creator.id)
        expect(received_post['parentPost']['userName']).to eq(parent_post.creator.name)
        expect(received_post['parentPost']['updatedAt'].to_datetime.utc).to \
          be_within(1.second).of parent_post.updated_at.utc
        expect(received_post['parentPost']['isUpdated']).to eq(false)
        expect(received_post['parentPost']['isDeleted']).to eq(false)
      end
    end
  end
end
