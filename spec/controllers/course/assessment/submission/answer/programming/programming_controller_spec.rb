# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Submission::Answer::Programming::ProgrammingController do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:user) { create(:user) }
    let!(:course) { create(:course, creator: user) }
    let(:assessment) { create(:assessment, :published, :with_programming_file_submission_question, course: course) }
    let(:submission) { create(:submission, :attempting, assessment: assessment, creator: user) }
    let(:submission_2) { create(:submission, :attempting, assessment: assessment, creator: user) }
    let(:answer) { submission.answers.first }
    let(:answer_2) { submission_2.answers.first }
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
    end

    describe '#delete_programming_file' do
      subject do
        post :destroy_programming_file, as: :json, params: {
          course_id: course, assessment_id: assessment.id, submission_id: submission_2.id,
          answer_id: answer_2.id, answer: {
            id: answer_2.id,
            file_id: answer_2.specific.files.first.id
          }
        }
      end

      context 'when deleting existing programming files' do
        it { expect { subject }.to change { answer_2.specific.files.count }.by(-1) }
      end
    end
  end
end
