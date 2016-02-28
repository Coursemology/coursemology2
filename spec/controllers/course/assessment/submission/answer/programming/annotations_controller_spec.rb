# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Submission::Answer::Programming::AnnotationsController do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:user) { create(:user) }
    let(:course) { create(:course, creator: user) }
    let(:assessment) { create(:assessment, :with_programming_question, course: course) }
    let(:submission) do
      create(:course_assessment_submission, :submitted, assessment: assessment, user: user)
    end
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
      subject do
        controller.instance_variable_set(:@annotation, immutable_annotation)
        post :create, format: :js, course_id: course, assessment_id: assessment,
                      submission_id: submission, answer_id: answer, file_id: file,
                      id: immutable_annotation,
                      annotation: {
                        answer_id: answer.id
                      },
                      discussion_post: {
                        text: post_text
                      }
      end

      context 'when saving fails' do
        it 'returns HTTP 400' do
          subject
          expect(response.status).to eq(400)
        end
      end
    end
  end
end
