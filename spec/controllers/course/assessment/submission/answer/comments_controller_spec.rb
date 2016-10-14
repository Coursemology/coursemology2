# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Submission::Answer::CommentsController do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:user) { create(:user) }
    let(:course) { create(:course, creator: user) }
    let(:assessment) { create(:assessment, :with_programming_question, course: course) }
    let(:submission) { create(:submission, :submitted, assessment: assessment, creator: user) }
    let(:immutable_answer) do
      submission.answers.first.tap do |stub|
        allow(stub).to receive(:save).and_return(false)
      end
    end
    let(:immutable_comment) do
      create(:course_discussion_post, topic: submission.answers.first.discussion_topic,
                                      creator: user, updater: user).tap do |stub|
        allow(stub).to receive(:save).and_return(false)
      end
    end

    before { sign_in(user) }

    describe '#create' do
      let(:parent_id) { immutable_answer.posts.build.parent_id }
      let(:comment) { 'new answer comment' }

      subject do
        post :create, format: :js, course_id: course, assessment_id: assessment,
                      submission_id: submission, answer_id: immutable_answer,
                      discussion_post: {
                        parent_id: parent_id,
                        text: comment
                      }
      end

      context 'when comment creation fails' do
        before do
          controller.instance_variable_set(:@answer, immutable_answer)
          subject
        end

        it 'returns HTTP 400' do
          expect(response.status).to eq(400)
        end
      end
    end
  end
end
