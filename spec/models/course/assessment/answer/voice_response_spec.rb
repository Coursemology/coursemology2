# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Answer::VoiceResponse, type: :model do
  it { is_expected.to act_as(Course::Assessment::Answer) }

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    describe '#compare_answer' do
      let(:answer1) do
        create(:course_assessment_answer_voice_response)
      end
      let(:answer2) do
        create(:course_assessment_answer_voice_response).tap do |answer2|
          attachment1 = create(:attachment_reference, name: 'att1.wav')
          attachment1.save!
          answer2.attachment_references << attachment1
        end
      end
      let(:answer3) do
        create(:course_assessment_answer_voice_response).tap do |answer3|
          attachment1 = create(:attachment_reference, name: 'att2.wav')
          attachment1.save!
          answer3.attachment_references << attachment1
        end
      end

      it 'compares if the answers are the same or not' do
        expect(answer1.compare_answer(answer1)).to be_truthy
        expect(answer1.compare_answer(answer2)).to be_falsey
        expect(answer1.compare_answer(answer3)).to be_falsey
        expect(answer2.compare_answer(answer3)).to be_falsey
        expect(answer3.compare_answer(answer3)).to be_truthy
      end
    end
  end
end
