# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Submission::Answer::Programming::FilesController do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:user) { create(:user) }
    let(:course) { create(:course, creator: user) }
    let(:assessment) { create(:assessment, :with_programming_question, course: course) }
    let(:submission) { create(:submission, :submitted, assessment: assessment, creator: user) }
    let(:answer) { submission.answers.first }
    let(:file) { answer.actable.files.first }

    before { sign_in(user) }

    describe '#download' do
      subject do
        get :download, params: {
          course_id: course.id, assessment_id: assessment.id, submission_id: submission.id,
          answer_id: answer.id, id: file.id
        }
      end

      before do
        controller.instance_variable_set(:@file, file)
        file.content = 'print("Hello world!")'
        file.save
        subject
      end

      it 'returns a text file' do
        expect(response.header['Content-Type']).to include('text/plain')
        expect(response.body).to eq(file.content)
        expect(response.status).to eq(200)
      end
    end
  end
end
