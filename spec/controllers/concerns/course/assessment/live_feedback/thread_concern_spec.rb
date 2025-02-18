# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::LiveFeedback::ThreadConcern do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let!(:student) { create(:user, name: 'Student') }

    class self::DummyController < ApplicationController
      include Course::Assessment::LiveFeedback::ThreadConcern
    end

    let!(:dummy_controller) { self.class::DummyController.new }
    let!(:course) { create(:course) }
    let!(:course_user) { create(:course_student, course: course, user: student) }
    let!(:assessment) { create(:course_assessment_assessment, :with_programming_question, course: course) }
    let!(:submission) do
      create(:course_assessment_submission, :attempting, assessment: assessment, creator: student)
    end
    let!(:answer) { submission.answers.where(actable_type: 'Course::Assessment::Answer::Programming').first }
    let!(:question) { answer.question }
    let!(:submission_question) do
      Course::Assessment::SubmissionQuestion.create!(submission: submission, question: question)
    end

    let!(:thread_info) { { 'id' => SecureRandom.hex(12), 'status' => 'active' } }

    before do
      controller_sign_in(dummy_controller, student)

      dummy_controller.instance_variable_set(:@submission, submission)
      dummy_controller.instance_variable_set(:@answer, answer)
    end

    context 'when creating thread' do
      it 'save thread accordingly, and upon second time, return existing thread' do
        dummy_controller.send(:save_thread_info, thread_info, submission_question.id)

        new_thread = Course::Assessment::LiveFeedback::Thread.find_by(submission_question_id: submission_question.id)
        expect(new_thread).to be_present

        expect(new_thread.codaveri_thread_id).to eq(thread_info['id'])
        expect(new_thread.is_active).to eq(thread_info['status'] == 'active')
        expect(new_thread.submission_creator_id).to eq(submission.creator_id)
        expect(new_thread.created_at).to be_within(1.second).of(Time.zone.now)

        status, body = dummy_controller.send(:safe_create_and_save_thread_info)
        expect(status).to eq(200)
        expect(body['thread']['id']).to eq(thread_info['id'])
        expect(body['thread']['status']).to eq(thread_info['status'])
      end
    end
  end
end
