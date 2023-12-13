# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Submission::Answer::Programming::ProgrammingController do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:user) { create(:user) }
    let!(:course) { create(:course, creator: user) }
    let(:assessment) { create(:assessment, :published, :with_programming_file_submission_question, course: course) }
    let(:submission) { create(:submission, :attempting, assessment: assessment, creator: user) }
    let(:submission2) { create(:submission, :attempting, assessment: assessment, creator: user) }
    let(:answer) { submission.answers.first }
    let(:answer2) { submission2.answers.first }
    before { sign_in(user) }

    describe '#create_programming_files' do
      let(:existing_file_attribute) { { id: answer.specific.files.first.id, content: 'code' } }
      let(:new_file_attribute) { { filename: 'template', content: 'this is some code' } }

      subject do
        post :create_programming_files, as: :json, params: {
          course_id: course, assessment_id: assessment.id, submission_id: submission.id,
          answer_id: answer.id, answer: {
            id: submission.answers.first.id,
            files_attributes: [existing_file_attribute, new_file_attribute]
          }
        }
      end

      context 'when creating new programming files' do
        before { subject }

        it 'updates other existing files' do
          expect(answer.specific.files.first.content).to eq('code')
        end

        it 'creates a new programming file' do
          expect(answer.specific.files.count).to eq(2)
        end
      end

      context 'when uploading new programming files with more than 50KB' do
        # defining a file that has size more than 50KB
        let(:large_file_attribute) { { filename: 'template2', content: 'a' * ((50 * 1024) + 1) } }

        it 'expects to return a bad request' do
          post :create_programming_files, as: :json, params: {
            course_id: course, assessment_id: assessment.id, submission_id: submission.id,
            answer_id: answer.id, answer: {
              id: submission.answers.first.id,
              files_attributes: [large_file_attribute]
            }
          }
          expect(response).to have_http_status(:bad_request)
        end
      end
    end

    describe '#delete_programming_file' do
      subject do
        post :destroy_programming_file, as: :json, params: {
          course_id: course, assessment_id: assessment.id, submission_id: submission2.id,
          answer_id: answer2.id, answer: {
            id: answer2.id,
            file_id: answer2.specific.files.first.id
          }
        }
      end

      context 'when deleting existing programming files' do
        it { expect { subject }.to change { answer2.specific.files.count }.by(-1) }
      end
    end
  end
end
