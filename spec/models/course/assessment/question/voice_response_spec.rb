# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::VoiceResponse, type: :model do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    subject { Course::Assessment::Question::VoiceResponse.new }

    describe '#question_type' do
      it 'returns correct type' do
        expect(subject.question_type).to eq I18n.t('course.assessment.question.voice_responses.question_type')
      end
    end
  end
end
