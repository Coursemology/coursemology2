# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::ProgrammingImportService do
  include ActiveSupport::Testing::TimeHelpers

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:question) { create(:course_assessment_question_programming, template_file_count: 0) }
    let(:package_path) do
      File.join(Rails.root, 'spec/fixtures/course/programming_question_template.zip')
    end
    let(:attachment) { create(:attachment_reference, binary: true, file_path: package_path) }
    subject { Course::Assessment::Question::ProgrammingImportService.new(question, attachment) }

    describe '.import' do
      subject { Course::Assessment::Question::ProgrammingImportService }
      it 'accepts attachments' do
        expect(subject).to receive(:new).
          with(question, instance_of(AttachmentReference), nil, nil).
          and_call_original
        subject.import(question, attachment)
      end

      context 'when an invalid package is provided' do
        let(:package_path) do
          File.join(Rails.root, 'spec/fixtures/course/empty_programming_question_template.zip')
        end

        it 'raises an InvalidDataError' do
          expect { subject.import(question, attachment) }.to raise_error(InvalidDataError)
        end
      end
    end

    describe '#import' do
      it 'imports the test cases' do
        subject.send(:import)
        expect(question.test_cases).not_to be_empty
      end

      it 'imports the template files' do
        subject.send(:import)
        expect(question.template_files).not_to be_empty
        expect(question.template_files.map(&:filename)).to contain_exactly('__init__.py')
      end

      context 'when the evaluation fails' do
        it 'raises an Course::Assessment::ProgrammingEvaluationService::Error' do
          mock_result = Course::Assessment::ProgrammingEvaluationService::Result.new('', '', {}, 1)
          expect(subject).to receive(:evaluate_package).and_return(mock_result)

          expect { subject.send(:import) }.to \
            raise_error(Course::Assessment::ProgrammingEvaluationService::Error)
        end
      end
    end

    describe '#import, when it replaces test cases the question already has' do
      let(:question) do
        create(:course_assessment_question_programming, template_package: true, test_case_count: 2, time_limit: 5)
      end
      # A package with different contents from the question's, so that their content-addressed attachments
      # differ.
      let(:package_path) do
        File.join(Rails.root, 'spec/fixtures/course/programming_question_template_with_add_files.zip')
      end
      let!(:old_test_case_ids) { question.test_cases.map(&:id) }
      let!(:old_template_file_ids) { question.template_files.map(&:id) }
      let!(:old_package_attachment_id) { question.attachment.attachment_id }
      let!(:old_result) do
        create(:course_assessment_answer_programming_auto_grading_test_result, test_case: question.test_cases.first)
      end
      # The edit that queued this import has already saved its new time limit to the question's row.
      let(:editor) { create(:user) }
      let(:previous_version) { question.attributes.merge('time_limit' => 3, 'superseder_id' => editor.id) }
      # With its associations loaded, as they are after any validation: the import must not destroy rows it has
      # moved just because the loaded association still holds them.
      let(:importing_question) do
        question.reload.tap do |q|
          q.test_cases.load
          q.template_files.load
        end
      end
      subject do
        Course::Assessment::Question::ProgrammingImportService.new(importing_question, attachment, previous_version)
      end

      it 'records the previous version as a snapshot of the question' do
        subject.send(:import)
        snapshot = question.reload.snapshots.sole

        expect(snapshot).to be_snapshot
        expect(snapshot.current).to eq(question)
        expect(snapshot.time_limit).to eq(3)
        expect(snapshot.import_job_id).to be_nil
        expect(question).not_to be_snapshot
      end

      it 'records when the previous version was superseded, and by whose edit' do
        freeze_time do
          subject.send(:import)
          snapshot = question.reload.snapshots.sole

          expect(snapshot.superseded_at).to eq(Time.current)
          expect(snapshot.superseder).to eq(editor)
          expect(question.superseded_at).to be_nil
          expect(question.superseder).to be_nil
        end
      end

      it 'creates no parent question for the snapshot' do
        expect { subject.send(:import) }.not_to change(Course::Assessment::Question, :count)
      end

      it 'moves the old test cases onto the snapshot, keeping their ids and results' do
        subject.send(:import)
        snapshot = question.reload.snapshots.sole

        expect(snapshot.test_cases.map(&:id)).to match_array(old_test_case_ids)
        expect(old_result.reload.test_case.question_id).to eq(snapshot.id)
        expect(question.test_cases).not_to be_empty
        expect(question.test_cases.map(&:id)).not_to include(*old_test_case_ids)
      end

      it 'moves the old template files onto the snapshot' do
        subject.send(:import)
        snapshot = question.reload.snapshots.sole

        expect(snapshot.template_files.map(&:id)).to match_array(old_template_file_ids)
        expect(question.template_files.map(&:id)).not_to include(*old_template_file_ids)
      end

      it 'gives the snapshot its own reference to the previous package' do
        subject.send(:import)
        question.reload
        snapshot = question.snapshots.sole

        expect(snapshot.attachment.attachment_id).to eq(old_package_attachment_id)
        expect(question.attachment.attachment_id).to eq(attachment.attachment_id)
        expect(question.attachment.attachment_id).not_to eq(old_package_attachment_id)
      end

      # A time limit, memory limit or language change re-imports the package the question already has.
      context 'when re-importing the package the question already has' do
        let(:attachment) { question.attachment }

        it 'gives the snapshot its own reference to that same package' do
          subject.send(:import)
          question.reload
          snapshot = question.snapshots.sole

          expect(snapshot.attachment.attachment_id).to eq(old_package_attachment_id)
          expect(snapshot.attachment.id).not_to eq(question.attachment.id)
          expect(question.attachment.attachment_id).to eq(old_package_attachment_id)
        end
      end

      context 'when no previous version is given' do
        let(:previous_version) { nil }

        it 'takes the question as it is now as the previous version' do
          subject.send(:import)
          expect(question.reload.snapshots.sole.time_limit).to eq(5)
        end

        it 'records when the previous version was superseded, but no superseder' do
          subject.send(:import)
          snapshot = question.reload.snapshots.sole

          expect(snapshot.superseded_at).to be_present
          expect(snapshot.superseder).to be_nil
        end
      end

      # Two imports of the same question saving at once, on separate connections as two import jobs would: the other
      # import reaches its save while this one's save is still open. Neither is run by a job, so neither is
      # superseded; only the lock orders them.
      context 'when another import saves at the same time' do
        let(:other_package) do
          path = File.join(Rails.root, 'spec/fixtures/course/programming_question_template.zip')
          create(:attachment_reference, binary: true, file_path: path)
        end

        # Starts the other import once this one has taken its snapshot, and waits until Postgres reports it blocked.
        def start_other_import_mid_save
          question_id = question.id
          package = other_package
          other_pids = Queue.new
          grading_thread = Thread.current
          other_import = nil
          allow_any_instance_of(Course::Assessment::Question::Programming).
            to receive(:snapshot_current_version!).and_wrap_original do |original, *args|
            original.call(*args).tap do
              next if Thread.current != grading_thread || other_import

              other_import = Thread.new do
                ActiveRecord::Base.connection_pool.with_connection do |connection|
                  other_pids << connection.select_value('SELECT pg_backend_pid()')
                  ActsAsTenant.without_tenant do
                    Course::Assessment::Question::ProgrammingImportService.
                      import(Course::Assessment::Question::Programming.find(question_id), package)
                  end
                end
              end
              ActiveSupport::Dependencies.interlock.permit_concurrent_loads { wait_until_blocked(other_pids.pop) }
            end
          end
          -> { ActiveSupport::Dependencies.interlock.permit_concurrent_loads { other_import.join } }
        end

        def wait_until_blocked(pid)
          deadline = 30.seconds.from_now
          connection = ActiveRecord::Base.lease_connection
          loop do
            # Activity statistics are otherwise cached for the rest of this transaction.
            connection.select_value('SELECT pg_stat_clear_snapshot()')
            wait_event_type = connection.select_value("SELECT wait_event_type FROM pg_stat_activity WHERE pid = #{pid}")
            break if wait_event_type == 'Lock'
            raise 'the other import never blocked' if Time.current > deadline

            sleep 0.05
          end
        end

        it 'applies them one after the other, keeping every replaced version' do
          finish_other_import = start_other_import_mid_save
          subject.send(:import)
          finish_other_import.call

          question.reload
          first_snapshot, second_snapshot = question.snapshots.order(:id).to_a
          expect(question.snapshots.ids.size).to eq(2)
          expect(first_snapshot.test_cases.map(&:id)).to match_array(old_test_case_ids)
          # The version this import created, replaced by the other import.
          expect(second_snapshot.test_cases).not_to be_empty
          expect(second_snapshot.attachment.attachment_id).to eq(attachment.attachment_id)
          expect(question.attachment.attachment_id).to eq(other_package.attachment_id)
          expect(question.test_cases).not_to be_empty
        end
      end

      # An edit records the import job it schedules on the question, in the edit's own transaction. An import run by
      # such a job applies only while the question still records it: a later edit, or removing the package,
      # supersedes it.
      describe 'when run by a scheduled import job' do
        let(:this_job) { TrackableJob::Job.create!(id: SecureRandom.uuid) }
        let(:later_job) { TrackableJob::Job.create!(id: SecureRandom.uuid) }
        subject do
          Course::Assessment::Question::ProgrammingImportService.
            new(importing_question, attachment, previous_version, this_job.id)
        end

        def expect_question_unchanged
          question.reload
          expect(question.snapshots.ids).to be_empty
          expect(question.test_cases.map(&:id)).to match_array(old_test_case_ids)
          expect(question.attachment.attachment_id).to eq(old_package_attachment_id)
        end

        context 'when the question still records it' do
          before { question.update_column(:import_job_id, this_job.id) }

          it 'imports the package' do
            expect(subject.send(:import)).to be(true)
            expect(question.reload.snapshots.ids.size).to eq(1)
            expect(question.attachment.attachment_id).to eq(attachment.attachment_id)
          end
        end

        context 'when a later edit has scheduled another import' do
          before { question.update_column(:import_job_id, later_job.id) }

          it 'imports nothing, without evaluating the package' do
            expect(Course::Assessment::ProgrammingEvaluationService).not_to receive(:execute)
            expect(subject.send(:import)).to be(false)
            expect_question_unchanged
          end
        end

        context 'when the package has since been removed' do
          before { question.update_column(:import_job_id, nil) }

          it 'imports nothing' do
            expect(subject.send(:import)).to be(false)
            expect_question_unchanged
          end
        end

        # What decides is the check made holding the lock, once the package has been evaluated.
        context 'when a later edit schedules another import while the package is being evaluated' do
          before do
            question.update_column(:import_job_id, this_job.id)
            question_id = question.id
            later_job_id = later_job.id
            allow(Course::Assessment::ProgrammingEvaluationService).
              to receive(:execute).and_wrap_original do |original, *args|
              Course::Assessment::Question::Programming.unscoped.where(id: question_id).
                update_all(import_job_id: later_job_id)
              original.call(*args)
            end
          end

          it 'imports nothing' do
            expect(subject.send(:import)).to be(false)
            expect_question_unchanged
          end
        end
      end

      context 'when saving the imported package fails' do
        before do
          allow_any_instance_of(Course::Assessment::Question::Programming).
            to receive(:save!).and_raise('save failed')
        end

        it 'leaves the question exactly as it was' do
          expect { subject.send(:import) }.to raise_error('save failed')

          question.reload
          expect(question.snapshots.ids).to be_empty
          expect(question.test_cases.map(&:id)).to match_array(old_test_case_ids)
          expect(question.template_files.map(&:id)).to match_array(old_template_file_ids)
          expect(old_result.reload.test_case.question_id).to eq(question.id)
        end
      end
    end

    describe '#import, when the question has no test cases yet' do
      it 'records no previous version' do
        subject.send(:import)
        expect(question.reload.snapshots.ids).to be_empty
      end
    end

    describe '#save' do
      it 'does not trigger another attachment import' do
        expect(question).to receive(:imported_attachment=).with(attachment)
        mock_result = Course::Assessment::ProgrammingEvaluationService::Result.new('', '', {}, 1)
        subject.send(:save!, {}, mock_result.test_reports)
      end
    end

    describe '#infer_test_case_type' do
      it 'infers that the test case is public' do
        expect(subject.send(:infer_test_case_type, 'test_public_fractal')).to eq(:public_test)
      end

      it 'infers that the test case is private' do
        expect(subject.send(:infer_test_case_type, 'test_private_fractal')).to eq(:private_test)
      end

      it 'infers that the test case is an evaluation test' do
        expect(subject.send(:infer_test_case_type, 'test_evaluation_fractal')).
          to eq(:evaluation_test)
      end
    end
  end
end
