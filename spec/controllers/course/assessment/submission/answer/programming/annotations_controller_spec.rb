# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Submission::Answer::Programming::AnnotationsController do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:user) { create(:user) }
    let(:course) { create(:course, creator: user) }
    let(:assessment) { create(:assessment, :with_programming_question, course: course) }
    let(:submission) { create(:submission, :submitted, assessment: assessment, creator: user) }
    let(:answer) { submission.answers.first }
    let(:file) { answer.actable.files.first }
    let(:immutable_annotation) do
      create(:course_assessment_answer_programming_file_annotation, file: file).tap do |stub|
        allow(stub).to receive(:save).and_return(false)
      end
    end

    before { sign_in(user) }

    describe '#create' do
      let(:post_text) { 'test post text' }
      let(:workflow_state) { 'published' }
      subject do
        post :create, as: :js, params: {
          course_id: course, assessment_id: assessment,
          submission_id: submission, answer_id: answer, file_id: file,
          id: immutable_annotation, line: 1,
          annotation: {
            answer_id: answer.id
          },
          discussion_post: {
            text: post_text,
            workflow_state: workflow_state
          }
        }
      end

      context 'when saving fails' do
        before do
          controller.instance_variable_set(:@annotation, immutable_annotation)
          subject
        end

        it 'returns HTTP 400' do
          expect(response.status).to eq(400)
        end
      end

      context 'when saving succeeds' do
        it 'returns HTTP 200' do
          subject
          expect(response.status).to eq(200)
        end

        context 'when other users are subscribed to notifications', type: :mailer do
          let(:annotation) do
            create(:course_assessment_answer_programming_file_annotation, file: file, line: 1)
          end
          let!(:subscriber) do
            user = create(:course_manager, course: course).user
            annotation.acting_as.subscriptions.create!(user: user)
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
              email_setting = course.
                              setting_emails.
                              where(component: :assessments,
                                    course_assessment_category_id: assessment.tab.category.id,
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
