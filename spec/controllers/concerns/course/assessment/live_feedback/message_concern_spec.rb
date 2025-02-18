# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::LiveFeedback::MessageConcern do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let!(:student) { create(:user, name: 'Student') }

    class self::DummyController < ApplicationController
      include Course::Assessment::LiveFeedback::MessageConcern
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
      Course::Assessment::SubmissionQuestion.create!(submission_id: submission.id, question_id: question.id)
    end

    let!(:codaveri_thread_id) { SecureRandom.hex(12) }
    let!(:thread) do
      Course::Assessment::LiveFeedback::Thread.create!(codaveri_thread_id: codaveri_thread_id,
                                                       submission_question: submission_question,
                                                       is_active: true,
                                                       submission_creator_id: submission.creator_id,
                                                       created_at: Time.zone.now)
    end
    let!(:message) { 'This is a message' }
    let!(:option_id) { 2 }
    let!(:options) { [1, 2, 3] }

    let!(:second_message) { 'This is a second message' }
    let!(:second_option_id) { 3 }

    before do
      controller_sign_in(dummy_controller, student)

      options.each do |_|
        Course::Assessment::LiveFeedback::Option.create!(option_type: 0, is_enabled: true)
      end

      dummy_controller.instance_variable_set(:@thread_id, codaveri_thread_id)
      dummy_controller.instance_variable_set(:@message, message)
      dummy_controller.instance_variable_set(:@option_id, option_id)
      dummy_controller.instance_variable_set(:@options, options)
      dummy_controller.instance_variable_set(:@answer, answer)
    end

    context 'in saving message inside thread' do
      it 'update thread, message, and file accordingly' do
        # Calling handle_save_user_message method first time
        dummy_controller.send(:handle_save_user_message)

        current_thread = dummy_controller.instance_variable_get(:@thread)
        current_answer = dummy_controller.instance_variable_get(:@answer)

        expect(current_thread.messages.count).to eq(1)
        expect(current_thread.messages.first.content).to eq(message)
        expect(current_thread.messages.first.option_id).to eq(option_id)
        expect(current_thread.messages.first.creator_id).to eq(student.id)

        message = current_thread.messages.first
        expect(message.message_files.count).to eq(current_answer.actable.files.count)

        message.message_files.each do |message_file|
          programming_file = current_answer.actable.files.find do |file|
            file.filename == message_file.file.filename &&
              file.content == message_file.file.content
          end
          expect(programming_file).not_to be_nil
        end
      end
    end

    context 'when answer not updated while sending new message' do
      it 'associates new message with existing files' do
        dummy_controller.send(:handle_save_user_message)

        current_thread = dummy_controller.instance_variable_get(:@thread)
        current_answer = dummy_controller.instance_variable_get(:@answer)

        # Calling handle_save_user_message method second time
        dummy_controller.instance_variable_set(:@message, second_message)
        dummy_controller.instance_variable_set(:@option_id, second_option_id)

        dummy_controller.send(:handle_save_user_message)
        expect(current_thread.messages.count).to eq(2)
        expect(current_thread.messages.last.content).to eq(second_message)
        expect(current_thread.messages.last.option_id).to eq(second_option_id)
        expect(current_thread.messages.last.creator_id).to eq(student.id)

        message = current_thread.messages.last
        expect(message.message_files.count).to eq(current_answer.actable.files.count)

        message.message_files.each do |message_file|
          programming_file = current_answer.actable.files.find do |file|
            file.filename == message_file.file.filename &&
              file.content == message_file.file.content
          end
          expect(programming_file).not_to be_nil
        end
      end
    end
  end
end
