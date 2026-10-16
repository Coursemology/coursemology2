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

    describe 'file size limit' do
      let(:max_size) { 1.kilobyte }

      # The real 15 MB limit would make every upload here 15 MB to hash and cache.
      before { stub_const('Course::Assessment::Answer::VoiceResponse::MAX_FILE_SIZE', max_size) }

      # Files of the same size and fill byte have the same content, so they share one deduplicated attachment.
      def audio_upload(size, fill = 'a')
        file = Tempfile.new(['voice', '.m4a'])
        file.write(fill * size)
        file.flush
        Rack::Test::UploadedFile.new(file.path, 'audio/mp4')
      end

      # As saved before the limit existed: set directly, without going through the upload check.
      def save_recording_before_limit(answer, size)
        answer.attachment_reference = AttachmentReference.new(file: audio_upload(size, 'z'))
        answer.save!
      end

      describe 'an upload' do
        let(:answer) { create(:course_assessment_answer_voice_response) }

        it 'is refused when over the limit' do
          answer.assign_params(file: audio_upload(max_size + 1))

          expect(answer).not_to be_valid
          expect(answer.errors).to be_of_kind(:attachment, :exceed_size_limit)
        end

        it 'is accepted at the limit' do
          answer.assign_params(file: audio_upload(max_size))

          expect(answer).to be_valid
        end

        it 'is refused when over the limit, even if its content is already stored as an attachment' do
          Attachment.find_or_create_by(file: audio_upload(max_size + 1))
          answer.assign_params(file: audio_upload(max_size + 1))

          expect(answer).not_to be_valid
        end

        it 'when refused, leaves the saved recording in place' do
          answer.assign_params(file: audio_upload(max_size / 2))
          answer.save!
          saved_reference_id = answer.attachment_reference.id

          answer.assign_params(file: audio_upload(max_size + 1, 'b'))

          expect(answer.save).to be(false)
          expect(answer.reload.attachment_reference&.id).to eq(saved_reference_id)
        end
      end

      # Finalising queues auto-grading; run inline in a background thread, it would change the answers at
      # an unpredictable point in these examples.
      with_active_job_queue_adapter(:test) do
        context 'with a recording saved before the limit existed' do
          let(:course) { create(:course) }
          let(:student) { create(:course_student, course: course) }
          let(:assessment) { create(:assessment, :published, :with_voice_response_question, course: course) }
          let(:submission) do
            create(:submission, :attempting, assessment: assessment, creator: student.user, course_user: student)
          end
          let(:recording) { submission.current_answers.first.specific.attachment_reference.attachment }

          before do
            save_recording_before_limit(submission.current_answers.first.specific, max_size * 2)
            submission.finalise!
            submission.save!
          end

          it 'does not treat a copy of the answer as an upload' do
            # Copying (e.g. on unsubmission) gives the answer a new attachment reference, but no new file.
            answer = submission.reload.current_answers.first
            copy = answer.question.attempt(submission, answer).specific

            copy.valid?

            expect(copy.errors[:attachment]).to be_empty
          end

          it 'reports the recording as too large' do
            expect(submission.reload.current_answers.first.specific).to be_file_too_large
          end

          it 'keeps the recording through unsubmission' do
            saved_recording = recording

            submission.unsubmit!
            submission.save!

            current_answer = submission.reload.current_answers.first
            expect(current_answer).to be_attempting
            expect(current_answer.specific.attachment_reference.attachment).to eq(saved_recording)
          end

          it 'can still be force-submitted after unsubmission' do
            submission.unsubmit!
            submission.save!

            submission.reload.force_submit!

            expect(submission.reload).to be_submitted
          end
        end
      end
    end
  end
end
