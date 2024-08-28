# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::LiveFeedback do
  # Associations
  it { is_expected.to belong_to(:assessment).class_name('Course::Assessment').inverse_of(:live_feedbacks).required }
  it {
    is_expected.to belong_to(:question).class_name('Course::Assessment::Question').inverse_of(:live_feedbacks).required
  }
  it {
    is_expected.to have_many(:code).
      class_name('Course::Assessment::LiveFeedbackCode').
      inverse_of(:feedback).
      dependent(:destroy)
  }

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:assessment) { create(:assessment) }
    let(:question) { create(:course_assessment_question_programming, assessment: assessment) }
    let(:user) { create(:course_user, course: assessment.course).user }
    let(:files) do
      [
        Struct.new(:filename, :content).new('test1.rb', 'Hello World'),
        Struct.new(:filename, :content).new('test2.rb', 'Goodbye World')
      ]
    end

    describe '.create_with_codes' do
      context 'when the live feedback is successfully created' do
        it 'creates a live feedback with associated codes' do
          feedback = Course::Assessment::LiveFeedback.create_with_codes(
            assessment.id, question.id, user, nil, files
          )

          expect(feedback).to be_persisted
          expect(feedback.code.size).to eq(files.size)
          expect(feedback.code.map(&:filename)).to match_array(files.map(&:filename))
          expect(feedback.code.map(&:content)).to match_array(files.map(&:content))
        end
      end

      context 'when the live feedback fails to save' do
        it 'returns nil and logs an error' do
          allow_any_instance_of(Course::Assessment::LiveFeedback).to receive(:save).and_return(false)

          expect(Rails.logger).to receive(:error).with(/Failed to save live_feedback/)
          feedback = Course::Assessment::LiveFeedback.create_with_codes(
            assessment.id, question.id, user, nil, files
          )

          expect(feedback).to be_nil
        end
      end

      context 'when a live feedback code fails to save' do
        it 'logs an error and continues to create the live feedback' do
          allow_any_instance_of(Course::Assessment::LiveFeedbackCode).to receive(:save).and_return(false)

          expect(Rails.logger).to receive(:error).with(/Failed to save live_feedback_code/).twice
          feedback = Course::Assessment::LiveFeedback.create_with_codes(
            assessment.id, question.id, user, nil, files
          )

          expect(feedback).to be_persisted
          expect(feedback.code.size).to eq(0) # No codes should be saved
        end
      end
    end
  end
end
