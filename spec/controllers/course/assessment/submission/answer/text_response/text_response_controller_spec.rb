# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Submission::Answer::TextResponse::TextResponseController do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:user) { create(:user) }
    let!(:course) { create(:course, creator: user) }
    before { controller_sign_in(controller, user) }

    describe '#create_and_delete_files' do
      let(:assessment) { create(:assessment, :published, :with_file_upload_question, course: course) }
      let(:submission) { create(:submission, :attempting, assessment: assessment, creator: user) }
      let(:file1) { fixture_file_upload('files/picture.jpg', 'image/jpeg') }
      let(:file2) { fixture_file_upload('files/one-page-document.pdf', 'application/pdf') }
      let(:answer) do
        answer = submission.answers.first
        attachment = create(:attachment_reference)
        answer.specific.update(attachment_references: [attachment])
        answer
      end

      let(:json) { JSON.parse(response.body) }

      context 'when creating new files' do
        subject do
          post :create_files, as: :json, params: {
            course_id: course, assessment_id: assessment.id, submission_id: submission.id,
            answer_id: answer.id, answer: {
              id: answer.id, files: [file1, file2]
            }
          }
        end

        it 'attaches the files into the answer' do
          expect(subject).to have_http_status(:success)
          answer.reload
          filenames = answer.specific.attachments.map(&:name)
          expect(filenames).to include(file1.original_filename)
          expect(filenames).to include(file2.original_filename)
          expect(answer.specific.attachments.count).to eq(3)
        end
      end

      context 'when attempting to delete the file' do
        subject do
          patch :delete_file, as: :json, params: {
            course_id: course, assessment_id: assessment.id,
            submission_id: submission.id, answer_id: answer.id,
            attachment_id: answer.specific.attachments.first.id
          }
        end
        it 'removes the attachment from the answer' do
          expect { subject }.to change { answer.specific.attachments.count }.by(-1)
        end
      end
    end
  end
end
