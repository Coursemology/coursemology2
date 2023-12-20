# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Submission::Answer::TextResponse::TextResponseController do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:user) { create(:user) }
    let!(:course) { create(:course, creator: user) }
    let(:assessment) { create(:assessment, :published, :with_file_upload_question, course: course) }
    let(:submission) { create(:submission, :attempting, assessment: assessment, creator: user) }
    let(:answer) { submission.answers.first }
    before { sign_in(user) }

    describe '#upload_and_delete_files' do
      let(:file) { fixture_file_upload('files/picture.jpg', 'image/jpeg') }
      let(:json) { JSON.parse(response.body) }

      subject do
        post :upload_files, as: :json, params: {
          course_id: course, assessment_id: assessment.id, submission_id: submission.id,
          answer_id: answer.id, answer: {
            id: answer.id, files: [file]
          }
        }
      end

      context 'when uploading new files' do
        before { subject }

        it 'attach the file into the answer' do
          expect(answer.specific.attachments.first.name).to eq(file.original_filename)
          expect(answer.specific.attachments.count).to eq(1)
        end

        context 'when attempting to delete the file' do
          it 'remove the attachment from the answer' do
            expect do
              post :delete_file, as: :json, params: {
                course_id: course, assessment_id: assessment.id,
                submission_id: submission.id, answer_id: answer.id,
                attachmentId: answer.specific.attachments.first.id
              }
            end.to change { answer.specific.attachments.count }.by(-1)
          end
        end
      end
    end
  end
end
