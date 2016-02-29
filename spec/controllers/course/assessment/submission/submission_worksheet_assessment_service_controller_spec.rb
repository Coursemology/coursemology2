# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Submission::SubmissionsController do
  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:user) { create(:user) }
    let(:course) { create(:course, creator: user) }
    let(:assessment) { create(:assessment, :with_mcq_question, course: course) }
    let(:immutable_submission) do
      create(:submission, assessment: assessment, user: user).tap do |stub|
        assessment.questions.attempt(stub).each(&:save)
        allow(stub).to receive(:save).and_return(false)
      end
    end

    before { sign_in(user) }

    describe '#update_params' do
      let(:answer_attributes) { { discussion_topic_attributes: { posts_attributes: posts } } }
      let(:posts) { { '0' => post_attributes } }
      let(:post_attributes) { {} }

      let(:controller_service) { controller.send(:service) }
      let(:update_params) { controller_service.send(:update_params) }
      let(:comments_params) { update_params[:answers_attributes]['0'] }
      let(:post_params) { comments_params[:discussion_topic_attributes][:posts_attributes] }

      subject do
        controller.instance_variable_set(:@submission, immutable_submission)
        post :update, course_id: course, assessment_id: assessment, id: immutable_submission,
                      submission: {
                        answers_attributes: {
                          '0' => answer_attributes
                        }
                      }
      end

      context 'when no comment text is specified' do
        let(:post_attributes) { { text: '' } }
        it 'removes the post' do
          subject
          expect(post_params.first).to be_nil
        end
      end

      context 'when comment text is specified' do
        let(:post_attributes) { { text: 'test' } }
        it 'sets the title of the post to the title of the assessment' do
          subject

          expect(post_params.first.second[:title]).to eq(assessment.title)
        end
      end
    end
  end
end
