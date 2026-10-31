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
    before { controller_sign_in(controller, user) }

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

      context 'when uploading new programming files that are too large' do
        let(:max_file_size) { 2.kilobytes }
        let(:large_file_attribute) { { filename: 'template2', content: 'a' * (max_file_size + 1) } }

        it 'expects to return a bad request' do
          stub_const('Course::Assessment::Answer::Programming::MAX_TOTAL_FILE_SIZE', max_file_size)
          post :create_programming_files, as: :json, params: {
            course_id: course, assessment_id: assessment.id, submission_id: submission.id,
            answer_id: answer.id, answer: {
              id: submission.answers.first.id,
              files_attributes: [large_file_attribute]
            }
          }
          expect(response).to have_http_status(:bad_request)

          response_body = JSON.parse(response.body)
          errors = response_body['errors']
          expected_error_message = I18n.t('activerecord.errors.models.' \
                                          'course/assessment/answer/programming.' \
                                          'attributes.files.exceed_size_limit')

          expect(errors['files'].first).to include(expected_error_message)
        end

        it 'also rejects them for a Python question with file submission' do
          question = assessment.questions.first.specific
          question.update_column(:language_id, Coursemology::Polyglot::Language::Python::Python3Point10.instance.id)
          expect(question.reload.language.multiple_file_submission_whitelisted?).to be(true)

          stub_const('Course::Assessment::Answer::Programming::MAX_TOTAL_FILE_SIZE', max_file_size)
          post :create_programming_files, as: :json, params: {
            course_id: course, assessment_id: assessment.id, submission_id: submission.id,
            answer_id: answer.id, answer: { id: answer.id, files_attributes: [large_file_attribute] }
          }

          expect(response).to have_http_status(:bad_request)
          expect(answer.specific.reload.files.map(&:filename)).not_to include('template2')
        end
      end

      context 'when replacing a file with one whose name differs only in case' do
        it 'saves the new content under the new name' do
          file = answer.specific.files.first
          post :create_programming_files, format: :json, params: {
            course_id: course, assessment_id: assessment.id, submission_id: submission.id,
            answer_id: answer.id, answer: {
              id: answer.id, files_attributes: [id: file.id, filename: file.filename.upcase, content: 'new']
            }
          }

          expect(response).to have_http_status(:ok)
          expect(file.reload).to have_attributes(filename: file.filename.upcase, content: 'new')
        end
      end

      context 'when uploading an empty file' do
        # Sent as form fields, as the client sends them, in which an empty value is an empty string.
        it 'saves it as a file with no content' do
          post :create_programming_files, format: :json, params: {
            course_id: course, assessment_id: assessment.id, submission_id: submission.id,
            answer_id: answer.id, answer: {
              id: answer.id, files_attributes: [filename: 'pkg/__init__.py', content: '']
            }
          }

          expect(response).to have_http_status(:ok)
          file = answer.specific.reload.files.find_by(filename: 'pkg/__init__.py')
          expect(file).to be_present
          expect(file.content).to eq('')
        end
      end

      context 'when uploading a binary file' do
        it 'returns a bad request with a code the client can explain, and saves nothing' do
          post :create_programming_files, as: :json, params: {
            course_id: course, assessment_id: assessment.id, submission_id: submission.id,
            answer_id: answer.id, answer: {
              id: answer.id, files_attributes: [filename: 'archive.zip', content: "PK\u0003\u0004\u0000"]
            }
          }

          expect(response).to have_http_status(:bad_request)
          expect(JSON.parse(response.body)['codes']).to include('binary')
          expect(answer.specific.reload.files.map(&:filename)).not_to include('archive.zip')
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
