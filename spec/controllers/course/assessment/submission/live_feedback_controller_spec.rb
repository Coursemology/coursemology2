# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Submission::LiveFeedbackController, type: :controller do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let!(:user) { create(:user) }
    let!(:student) { create(:user, name: 'Student') }

    let!(:course) { create(:course, creator: user) }
    let!(:course_student) { create(:course_student, course: course, user: student) }
    let!(:assessment) { create(:assessment, :published_with_programming_question, course: course) }
    let!(:submission) { create(:submission, :attempting, assessment: assessment, creator: student) }
    let!(:answer) { submission.answers.where(actable_type: 'Course::Assessment::Answer::Programming').first }
    let!(:question) { answer.question }
    let!(:submission_question) do
      create(:submission_question, submission: submission, question: question)
    end

    let!(:codaveri_thread_id) { SecureRandom.hex(12) }
    let!(:student_prompt) { 'This is a student prompt' }
    let!(:feedback) { 'This is a feedback' }

    before do
      controller_sign_in(controller, student)

      new_thread = Course::Assessment::LiveFeedback::Thread.create!({
        codaveri_thread_id: codaveri_thread_id,
        submission_question: submission_question,
        is_active: true,
        submission_creator_id: submission.creator_id,
        created_at: Time.zone.now
      })

      message = Course::Assessment::LiveFeedback::Message.create!({
        thread: new_thread,
        is_error: false,
        content: student_prompt,
        creator_id: student.id,
        created_at: Time.zone.now,
        option_id: nil
      })

      answer.actable.files.each do |file|
        live_feedback_file = Course::Assessment::LiveFeedback::File.create!({
          filename: file.filename,
          content: file.content
        })

        Course::Assessment::LiveFeedback::MessageFile.create!({
          message: message,
          file: live_feedback_file
        })
      end
    end

    describe '#save_live_feedback' do
      context 'when saving new feedback' do
        it 'saves new feedback and associates with existing files' do
          post :save_live_feedback, params: {
            course_id: course.id,
            assessment_id: assessment.id,
            current_thread_id: codaveri_thread_id,
            content: feedback,
            is_error: false
          }

          expect(response).to have_http_status(:no_content)

          new_thread = Course::Assessment::LiveFeedback::Thread.find_by(codaveri_thread_id: codaveri_thread_id)
          expect(new_thread).to be_present

          new_message = new_thread.messages.last
          expect(new_message).to be_present
          expect(new_message.content).to eq(feedback)
          expect(new_message.is_error).to be_falsey
          expect(new_message.creator_id).to eq(0)

          new_message_files = new_message.message_files
          expect(new_message_files.count).to eq(1)
          expect(new_message_files.first.message_id).to eq(new_message.id)

          existing_files = Course::Assessment::LiveFeedback::File.find(new_message_files.first.file_id)
          expect(existing_files).to be_present

          expect(existing_files.filename).to eq(answer.actable.files.first.filename)
          expect(existing_files.content).to eq(answer.actable.files.first.content)
        end
      end
    end
  end
end
