# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::SubmissionQuestion::CommentsController do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let!(:submission_question) { create(:submission_question) }
    let!(:user) { submission_question.submission.creator }
    let(:assessment) { submission_question.submission.assessment }
    let(:course) { assessment.course }
    before { sign_in(user) }

    describe '#create' do
      let(:workflow_state) { 'published' }
      subject do
        post :create, as: :js, params: {
          course_id: course, assessment_id: assessment,
          submission_question_id: submission_question,
          discussion_post: {
            text: comment,
            workflow_state: workflow_state
          }
        }
      end

      before do
        controller.instance_variable_set(:@submission_question, submission_question)
      end

      context 'when comment creation fails' do
        let(:comment) { nil }

        it 'returns HTTP 400' do
          subject
          expect(response.status).to eq(400)
        end
      end

      context 'when comment creation succeeds' do
        let(:comment) { 'new comment' }

        it 'returns HTTP 200' do
          subject
          expect(response.status).to eq(200)
        end

        it 'adds a new comment' do
          expect { subject }.to change(Course::Discussion::Post, :count).by(1)
        end

        context 'when other users are subscribed to notifications', type: :mailer do
          let!(:subscriber) do
            user = create(:course_manager, course: course).user
            submission_question.acting_as.subscriptions.create!(user: user)
            user
          end

          it 'sends email notifications' do
            expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(1)
          end

          context 'when the new comment is posted as delayed post' do
            let!(:workflow_state) { 'delayed' }
            it 'does not send email notifications' do
              expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(0)
            end
          end

          context 'when "New Comment" email notification is disabled' do
            before do
              category_id = assessment.tab.category.id
              email_setting = course.
                              setting_emails.
                              where(component: :assessments,
                                    course_assessment_category_id: category_id,
                                    setting: :new_comment).first
              email_setting.update!(regular: false, phantom: false)
            end

            it 'does not send email notifications' do
              expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(0)
            end
          end
        end
      end
    end
  end
end
