# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::ProgrammingImportJob do
  let!(:instance) { create(:instance) }
  let(:time_limit) { 30.seconds }

  with_tenant(:instance) do
    subject { Course::Assessment::Question::ProgrammingImportJob }

    # Runs the import as an edit schedules it: recorded on the question as its import job, so that it is the import
    # to apply.
    def perform_recorded_import
      perform_sidekiq_jobs do
        job = subject.perform_later(question, attachment, time_limit)
        question.update_column(:import_job_id, job.job_id)
      end
    end
    let(:question) do
      create(:course_assessment_question_programming, template_file_count: 0)
    end
    let(:attachment) do
      create(:attachment_reference,
             file_path:
               File.join(Rails.root, 'spec/fixtures/course/programming_question_template.zip'),
             binary: true)
    end

    it 'can be queued' do
      expect { subject.perform_later(question, attachment, time_limit) }.to \
        have_enqueued_job(subject).exactly(:once)
    end

    it 'imports the templates', :sidekiq_same_thread do
      perform_recorded_import
      expect(question.reload.template_files).not_to be_empty
    end

    # The later edit's own import applies its package, pushes it and regrades.
    context 'when a later edit has scheduled another import' do
      it 'changes nothing, regrades nothing, and completes', :sidekiq_same_thread do
        later_job = TrackableJob::Job.create!(id: SecureRandom.uuid)
        expect(Course::Assessment::Question::AnswersEvaluationJob).not_to receive(:perform_later)
        superseded_job = nil
        perform_sidekiq_jobs do
          superseded_job = subject.perform_later(question, attachment, time_limit)
          question.update_column(:import_job_id, later_job.id)
        end

        expect(question.reload.template_files).to be_empty
        expect(question.test_cases).to be_empty
        expect(superseded_job.job.reload).to be_completed
      end
    end

    it 'imports the test cases', :sidekiq_same_thread do
      perform_recorded_import
      expect(question.reload.test_cases).not_to be_empty
    end

    it 'does not create codaveri question', :sidekiq_same_thread do
      perform_recorded_import
      question.reload

      expect(question.codaveri_id).to eq(nil)
      expect(question.codaveri_status).to eq(nil)
      expect(question.codaveri_message).to eq(nil)
    end

    context 'when the codaveri component is enabled' do
      let(:course) { create(:course) }
      let(:assessment) { create(:assessment, :with_programming_question, course: course) }
      let(:question) do
        create(:course_assessment_question_programming, template_file_count: 0, assessment: assessment,
                                                        is_codaveri: true)
      end
      let(:attachment) do
        create(:attachment_reference,
               file_path:
                 File.join(Rails.root, 'spec/fixtures/course/programming_question_template_codaveri.zip'),
               binary: true)
      end

      before do
        Course::Assessment::StubbedProgrammingEvaluationService.class_eval do
          prepend Course::Assessment::StubbedProgrammingEvaluationServiceForCodaveriTest
        end
        Excon.defaults[:mock] = true
        Excon.stub({ method: 'POST' }, Codaveri::CreateProblemApiStubs::CREATE_PROBLEM_SUCCESS)
      end

      after do
        Course::Assessment::ProgrammingEvaluationService.class_eval do
          prepend Course::Assessment::StubbedProgrammingEvaluationService
        end
        Excon.stubs.clear
      end

      it 'creates codaveri question', :sidekiq_same_thread do
        perform_recorded_import
        question.reload

        expect(question.codaveri_id).to eq('6311a0548c57aae93d260927')
        expect(question.codaveri_status).to eq(200)
        expect(question.codaveri_message).to eq('Problem successfully created')
      end

      # Imports of the same question can finish close together, and each pushes to Codaveri afterwards.
      context 'when a later import commits before this one pushes to Codaveri' do
        let(:later_attachment) do
          create(:attachment_reference,
                 file_path: File.join(Rails.root, 'spec/fixtures/course/programming_question_template.zip'),
                 binary: true)
        end
        let(:pushed_package_ids) { [] }

        before do
          later = later_attachment
          imports = 0
          allow(Course::Assessment::Question::ProgrammingImportService).
            to receive(:import).and_wrap_original do |original, *args, **kwargs|
            original.call(*args, **kwargs).tap do
              imports += 1
              original.call(Course::Assessment::Question::Programming.find(question.id), later) if imports == 1
            end
          end
          # Records which package is pushed; what Codaveri does with it is not at issue here.
          pushed = pushed_package_ids
          allow(Course::Assessment::Question::ProgrammingCodaveriService).
            to receive(:create_or_update_question) do |pushed_question, package|
            pushed << package.attachment_id
            pushed_question.update!(is_synced_with_codaveri: true)
          end
        end

        it 'pushes the latest version, not its own', :sidekiq_same_thread do
          perform_recorded_import

          expect(pushed_package_ids).to eq([later_attachment.attachment_id])
          expect(question.reload).to be_is_synced_with_codaveri
        end
      end

      context 'when Codaveri already has the previous version' do
        before { question.update_column(:is_synced_with_codaveri, true) }

        it 'still pushes the imported version', :sidekiq_same_thread do
          expect(Course::Assessment::Question::ProgrammingCodaveriService).
            to receive(:create_or_update_question).once.and_call_original
          perform_recorded_import

          expect(question.reload.codaveri_id).to eq('6311a0548c57aae93d260927')
        end
      end

      context 'when Codaveri rejects the question' do
        before { Excon.stub({ method: 'POST' }, Codaveri::CreateProblemApiStubs::CREATE_PROBLEM_FAILURE) }

        it 'records the failure on the question', :sidekiq_same_thread do
          perform_recorded_import
          question.reload

          expect(question.codaveri_status).to eq(500)
          expect(question.codaveri_message).to eq('Problem could not be created')
          expect(question).not_to be_is_synced_with_codaveri
        end
      end
    end
  end
end
