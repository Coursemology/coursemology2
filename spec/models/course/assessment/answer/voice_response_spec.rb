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

    describe 'file size validation' do
      let(:answer) { create(:course_assessment_answer_voice_response) }
      let(:max_size) { 1.kilobyte }

      # The real 15 MB limit would make every upload here 15 MB to hash and cache.
      before { stub_const('Course::Assessment::Answer::VoiceResponse::MAX_FILE_SIZE', max_size) }

      def audio_upload(size)
        file = Tempfile.new(['voice', '.m4a'])
        file.truncate(size)
        Rack::Test::UploadedFile.new(file.path, 'audio/mp4')
      end

      it 'rejects a newly assigned file over the limit' do
        answer.file = audio_upload(max_size + 1)

        expect(answer).not_to be_valid
        expect(answer.errors).to be_of_kind(:attachment, :exceed_size_limit)
      end

      it 'accepts a newly assigned file at the limit' do
        answer.file = audio_upload(max_size)

        expect(answer).to be_valid
      end

      it 'does not re-check a file saved before the limit existed' do
        answer.file = audio_upload(max_size / 2)
        answer.save!

        saved = answer.reload
        # Loaded, so that validation sees the stubbed attachment rather than querying a fresh copy.
        saved.attachment_references.load
        allow(saved.attachment_reference.attachment.file_upload).to receive(:size).and_return(max_size + 1)

        expect(saved).to be_valid
      end
    end
  end
end
