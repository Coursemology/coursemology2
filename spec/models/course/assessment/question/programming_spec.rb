# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::Programming do
  it { is_expected.to act_as(Course::Assessment::Question) }

  it 'belongs to an import job' do
    expect(subject).to belong_to(:import_job).
      class_name(TrackableJob::Job.name).
      optional
  end

  it 'has many template files' do
    expect(subject).to have_many(:template_files).
      class_name(Course::Assessment::Question::ProgrammingTemplateFile.name).dependent(:destroy)
  end

  it 'has many test cases' do
    expect(subject).to have_many(:test_cases).
      class_name(Course::Assessment::Question::ProgrammingTestCase.name).dependent(:destroy)
  end

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    describe 'validations' do
      let(:programming_max_time_limit_setting) do
        ActiveSupport::HashWithIndifferentAccess.new(programming_max_time_limit: 170)
      end
      let(:assessments_component_setting) do
        ActiveSupport::HashWithIndifferentAccess.new(course_assessments_component: programming_max_time_limit_setting)
      end
      let(:course) { create(:course, settings: assessments_component_setting) }
      let(:time_limit) { nil }
      let(:question_programming) { build(:course_assessment_question_programming, time_limit: time_limit) }

      context 'when the time limit is set to be higher than the max programming time limit in course settings' do
        let(:time_limit) { 171 }
        before do
          question_programming.max_time_limit = course.programming_max_time_limit
        end

        it 'is expected to be valid' do
          expect(question_programming).to_not be_valid
        end
      end

      context 'when the time limit is not set to be an integer' do
        let(:time_limit) { 'abcd' }
        before do
          question_programming.max_time_limit = course.programming_max_time_limit
        end

        it 'is expected to be invalid' do
          question_programming.max_time_limit = course.programming_max_time_limit
          expect(question_programming).to_not be_valid
        end
      end

      context 'when the time limit is set to zero' do
        let(:time_limit) { 0 }

        it 'is expected to be invalid' do
          expect(question_programming).to_not be_valid
        end
      end

      context 'when the time limit is set to be within the stipulated range (between 0 and an upper bound)' do
        let(:time_limit) { 170 }
        before do
          question_programming.max_time_limit = course.programming_max_time_limit
        end

        it 'is expected to be valid (upper bound checked)' do
          expect(question_programming).to be_valid
        end

        it 'is expected to be valid (lower bound checked)' do
          question_programming.time_limit = 1
          expect(question_programming).to be_valid
        end
      end

      context 'when the time limit is not set for the question' do
        it 'is expected to be valid' do
          expect(question_programming).to be_valid
        end
      end

      # Created rather than built: the factory skips package processing on built questions, which also skips
      # this validation.
      context 'when the language has been disabled' do
        let(:question) { create(:course_assessment_question_programming) }
        before do
          ActiveRecord::Base.connection.execute(
            "UPDATE polyglot_languages SET enabled = false WHERE id = #{question.language_id}"
          )
          question.reload
        end

        # This suite commits without rolling back (use_transactional_fixtures is false), so the language would
        # otherwise stay disabled for every spec that runs after this one.
        after do
          ActiveRecord::Base.connection.execute(
            "UPDATE polyglot_languages SET enabled = true WHERE id = #{question.language_id}"
          )
        end

        it 'is invalid' do
          expect(question).not_to be_valid
          expect(question.errors[:base]).to include(a_string_starting_with('The selected programming language ' \
                                                                           'has been deprecated'))
        end

        it 'is valid when package processing is skipped' do
          question.skip_process_package = true
          expect(question).to be_valid
        end
      end
    end

    describe 'callbacks' do
      subject { create(:course_assessment_question_programming, :auto_gradable) }

      describe 'before_save' do
        with_active_job_queue_adapter(:test) do
          context 'when a package is removed' do
            before do
              subject.attachment = nil
            end

            it 'does not queue any import jobs' do
              expect { subject.save }.not_to \
                have_enqueued_job(Course::Assessment::Question::ProgrammingImportJob)
              expect(subject.import_job).to be_nil
            end

            it 'removes existing template files' do
              subject.save!
              expect(subject.template_files).to be_empty
            end

            it 'removes existing test cases' do
              subject.save!
              expect(subject.test_cases).to be_empty
            end

            it 'removes the old import job' do
              subject.save!
              expect(subject.import_job).to be_nil
            end
          end

          context 'when a new package is uploaded' do
            let(:file) do
              File.new(File.join(Rails.root,
                                 'spec/fixtures/course/programming_question_template.zip'))
            end

            it 'queues a new import job' do
              old_job_id = subject.import_job

              subject.file = file
              expect { subject.save }.to \
                have_enqueued_job(Course::Assessment::Question::ProgrammingImportJob).exactly(:once)
              expect(subject.reload.import_job).not_to eq(old_job_id)
              expect(subject.import_job_id).to be_present
            end

            it 'reverts the change to the attachment' do
              original_attachment = subject.attachment

              subject.file = file
              expect { subject.save }.to change { subject.attachment }.to(original_attachment)
            end
          end

          # context 'when memory/time limit or language changed' do
          #   it 'queues a new import job' do
          #     old_job_id = subject.import_job

          #     subject.memory_limit = 10
          #     subject.save!
          #     expect(subject.reload.import_job).not_to eq(old_job_id)
          #   end
          # end

          # The save commits the new values long before the import runs, so the import is handed the values
          # it replaces in order to snapshot them -- this table's own columns only, not the parent question's.
          context 'when an edit queues an import' do
            let(:old_time_limit) { subject.time_limit }

            def expect_previous_version_passed_on(&save)
              queued_import = have_enqueued_job(Course::Assessment::Question::ProgrammingImportJob).
                              with do |_question, _attachment, _max_time_limit, previous_version|
                                expect(previous_version).to include('time_limit' => old_time_limit)
                                expect(previous_version.keys).
                                  to match_array(Course::Assessment::Question::Programming.column_names)
                              end
              expect(&save).to(queued_import)
            end

            it 'passes on the question as it was before a time limit change' do
              subject.time_limit = old_time_limit - 1
              expect_previous_version_passed_on { subject.save! }
            end

            it 'passes on the question as it was before a new package is uploaded' do
              subject.time_limit = old_time_limit - 1
              subject.file = File.new(File.join(Rails.root, 'spec/fixtures/course/programming_question_template.zip'))
              expect_previous_version_passed_on { subject.save! }
            end

            # So that the import job recorded on the question is always that of the latest edit to commit, which is
            # the only one an import applies for.
            it "records the job as the question's import job in the same save, before queueing it" do
              question_id = subject.id
              recorded_and_queued_job_ids = []
              allow_any_instance_of(Course::Assessment::Question::ProgrammingImportJob).
                to receive(:enqueue).and_wrap_original do |original, *args|
                recorded_job_id = Course::Assessment::Question::Programming.unscoped.
                                  where(id: question_id).pick(:import_job_id)
                recorded_and_queued_job_ids.push(recorded_job_id, original.receiver.job_id)
                original.call(*args)
              end
              subject.time_limit = old_time_limit - 1
              subject.save!

              recorded_job_id, queued_job_id = recorded_and_queued_job_ids
              expect(recorded_job_id).to eq(queued_job_id)
              expect(subject.reload.import_job_id).to eq(queued_job_id)
            end

            it 'records a job that cannot be queued as failed, so that the next save retries it' do
              allow_any_instance_of(Course::Assessment::Question::ProgrammingImportJob).
                to receive(:enqueue).and_raise(StandardError, 'queue unavailable')
              subject.time_limit = old_time_limit - 1

              expect { subject.save! }.to raise_error(StandardError, 'queue unavailable')
              expect(subject.reload.import_job).to be_errored
            end

            # Only the request knows who is editing; the import job that creates the snapshot runs without a user.
            it 'names the editor as the superseder of the version it replaces' do
              editor = create(:user)
              subject.time_limit = old_time_limit - 1
              queued_import = have_enqueued_job(Course::Assessment::Question::ProgrammingImportJob).
                              with do |*, previous_version|
                                expect(previous_version['superseder_id']).to eq(editor.id)
                              end
              expect { User.with_stamper(editor) { subject.save! } }.to(queued_import)
            end
          end
        end
      end
    end

    # A Codaveri push is recorded as the question's import job, for the edit page to follow, but must not take the
    # place of an import still to run: that import would then find itself superseded.
    describe 'recording a Codaveri push' do
      let(:question) { create(:course_assessment_question_programming, :auto_gradable) }
      let(:previous_job) { TrackableJob::Job.create!(id: SecureRandom.uuid, status: previous_job_status) }

      before { question.update_column(:import_job_id, previous_job.id) }

      with_active_job_queue_adapter(:test) do
        context 'when an import is still to run' do
          let(:previous_job_status) { :submitted }

          it 'leaves the import recorded' do
            question.send(:create_or_update_codaveri_problem)
            expect(question.reload.import_job_id).to eq(previous_job.id)
          end
        end

        context 'when the previous job has finished' do
          let(:previous_job_status) { :completed }

          it 'records the push' do
            question.send(:create_or_update_codaveri_problem)
            expect(question.reload.import_job_id).not_to eq(previous_job.id)
            expect(question.import_job_id).to be_present
          end
        end
      end
    end

    describe '#snapshots' do
      let(:question) { create(:course_assessment_question_programming, :auto_gradable) }
      let(:package) do
        path = File.join(Rails.root, 'spec/fixtures/course/programming_question_template_with_add_files.zip')
        create(:attachment_reference, binary: true, file_path: path)
      end
      before { Course::Assessment::Question::ProgrammingImportService.import(question, package) }

      it 'are destroyed with the question, along with their test cases and package references' do
        snapshot = question.reload.snapshots.sole
        snapshot_test_case_ids = snapshot.test_cases.map(&:id)
        expect(snapshot_test_case_ids).not_to be_empty

        question.destroy!

        expect(Course::Assessment::Question::Programming.where(id: snapshot.id).ids).to be_empty
        expect(Course::Assessment::Question::ProgrammingTestCase.where(id: snapshot_test_case_ids)).to be_empty
        expect(AttachmentReference.where(attachable_type: snapshot.class.name, attachable_id: snapshot.id)).
          to be_empty
      end

      context 'once taken' do
        let(:snapshot) { question.reload.snapshots.sole }

        it 'cannot be changed, or made live again' do
          expect { snapshot.update!(attempt_limit: 3) }.to raise_error(ActiveRecord::ReadOnlyRecord)
          expect { snapshot.reload.update!(current_id: nil) }.to raise_error(ActiveRecord::ReadOnlyRecord)
          expect(snapshot.reload).to have_attributes(attempt_limit: nil, current_id: question.id)
        end

        it 'cannot have its test cases or template files changed' do
          expect { snapshot.test_cases.first.update!(expected: 'changed') }.
            to raise_error(ActiveRecord::ReadOnlyRecord)
          expect { snapshot.template_files.first.update!(content: 'changed') }.
            to raise_error(ActiveRecord::ReadOnlyRecord)
        end

        it 'cannot have test cases or template files added, or moved onto or off it' do
          expect { snapshot.test_cases.create!(identifier: 'added', test_case_type: :public_test) }.
            to raise_error(ActiveRecord::ReadOnlyRecord)
          expect { snapshot.template_files.create!(filename: 'added.py', content: '') }.
            to raise_error(ActiveRecord::ReadOnlyRecord)
          # Loaded without the question, so that only the previous owner's id says where it came from.
          expect do
            Course::Assessment::Question::ProgrammingTestCase.find(question.test_cases.first.id).
              update!(question_id: snapshot.id)
          end.to raise_error(ActiveRecord::ReadOnlyRecord)
          expect do
            Course::Assessment::Question::ProgrammingTestCase.find(snapshot.test_cases.first.id).
              update!(question_id: question.id)
          end.to raise_error(ActiveRecord::ReadOnlyRecord)
        end

        it 'leaves the live question and its test cases and template files editable' do
          question.reload.update!(attempt_limit: 3)
          question.test_cases.first.update!(expected: 'changed')
          question.template_files.first.update!(content: 'changed')

          expect(question.reload.attempt_limit).to eq(3)
        end
      end

      it 'cannot be created through a save' do
        expect { create(:course_assessment_question_programming, current: question) }.
          to raise_error(ActiveRecord::ReadOnlyRecord)
      end
    end

    describe '#remove_package' do
      let(:question) { create(:course_assessment_question_programming, :auto_gradable) }
      let(:editor) { create(:user) }
      let(:non_autograded_template_files) do
        [Course::Assessment::Question::ProgrammingTemplateFile.new(filename: 'main.py', content: 'print(1)')]
      end

      def remove_package
        User.with_stamper(editor) do
          question.remove_package(non_autograded_template_files)
          question.save!
        end
      end

      it 'keeps the autograded version, with its package, as a snapshot' do
        test_case_ids = question.test_cases.map(&:id)
        template_file_ids = question.template_files.map(&:id)
        package_id = question.attachment.attachment_id

        remove_package

        snapshot = question.reload.snapshots.sole
        expect(snapshot.test_cases.map(&:id)).to match_array(test_case_ids)
        expect(snapshot.template_files.map(&:id)).to match_array(template_file_ids)
        expect(snapshot.attachment.attachment_id).to eq(package_id)
        expect(snapshot.superseder).to eq(editor)
        expect(question.test_cases).to be_empty
        expect(question.attachment).to be_nil
        expect(question.template_files.map(&:filename)).to contain_exactly('main.py')
      end

      context 'when the question is not autograded' do
        let(:question) { create(:course_assessment_question_programming) }

        it 'keeps no snapshot' do
          remove_package

          expect(question.reload.snapshots.ids).to be_empty
        end
      end
    end

    describe '#auto_gradable?' do
      subject do
        build_stubbed(:course_assessment_question_programming, test_case_count: test_case_count)
      end

      context 'when the question has test cases' do
        let(:test_case_count) { 1 }
        it 'returns true' do
          expect(subject).to be_auto_gradable
        end
      end

      context 'when the question has no test cases' do
        let(:test_case_count) { 0 }
        it 'returns false' do
          expect(subject).not_to be_auto_gradable
        end
      end
    end

    describe '#attempt' do
      subject { question }
      let(:question) do
        question = create(:course_assessment_question_programming, template_file_count: 1)
        create(:course_question_assessment, question: question.acting_as, assessment: assessment)
        question
      end
      let(:assessment) { create(:assessment) }
      let(:course) { assessment.course }
      let(:student_user) { create(:course_student, course: course).user }
      let(:submission) { create(:submission, assessment: assessment, creator: student_user) }

      it 'returns an Answer' do
        expect(subject.attempt(submission)).to be_a(Course::Assessment::Answer)
      end

      it 'copies all the template files' do
        answer = subject.attempt(submission).specific
        expect(subject.template_files).not_to be_empty

        subject.template_files.each do |template_file|
          matching_answer_file = answer.files.find do |answer_file|
            answer_file.filename == template_file.filename &&
              answer_file.content == template_file.content
          end
          expect(matching_answer_file).not_to be_nil
        end
      end

      context 'when last_attempt is given' do
        let(:last_attempt) do
          create(:course_assessment_answer_programming, file_contents: ['python file', 'js file'])
        end

        it 'builds a new answer with old file contents' do
          answer = subject.attempt(submission, last_attempt).actable
          answer.save!

          expect(last_attempt.files.map(&:filename)).
            to contain_exactly(*answer.files.map(&:filename))

          expect(last_attempt.files.map(&:content)).
            to contain_exactly(*answer.files.map(&:content))
        end
      end
    end

    describe '#imported_attachment=' do
      with_active_job_queue_adapter(:test) do
        subject { create(:course_assessment_question_programming) }
        it 'does not enqueue another import job' do
          subject.imported_attachment = build(:attachment_reference)
          expect { subject.save }.not_to have_enqueued_job
        end
      end
    end

    describe '#auto_grader' do
      subject { build(:course_assessment_question_programming, is_codaveri: is_codaveri) }

      context 'when the evaluator is the default coursemology evaluator' do
        let(:is_codaveri) { false }
        it 'returns correct autograder' do
          expect(subject.auto_grader.class).to eq Course::Assessment::Answer::ProgrammingAutoGradingService
        end
      end

      context 'when the evaluator is codaveri evaluator' do
        let(:is_codaveri) { true }
        it 'returns correct autograder' do
          expect(subject.auto_grader.class).to eq Course::Assessment::Answer::ProgrammingCodaveriAutoGradingService
        end
      end
    end

    describe '#question_type_readable' do
      subject { build(:course_assessment_question_programming, is_codaveri: is_codaveri) }

      context 'when the evaluator is the default coursemology evaluator' do
        let(:is_codaveri) { false }
        it 'returns correct question type' do
          expect(subject.question_type_readable).to eq I18n.t('course.assessment.question.programming.question_type')
        end
      end

      context 'when the evaluator is codaveri evaluator' do
        let(:is_codaveri) { true }
        it 'returns correct question type' do
          expect(subject.question_type_readable).to eq(
            I18n.t('course.assessment.question.programming.question_type_codaveri')
          )
        end
      end
    end

    describe '#validate_codaveri_question' do
      let(:subject_evaluator) do
        build(:course_assessment_question_programming, is_codaveri: true, assessment: assessment, language: language)
      end
      let(:subject_feedback) do
        build(:course_assessment_question_programming, live_feedback_enabled: true,
                                                       assessment: assessment, language: language)
      end
      let(:assessment) { create(:assessment, :published_with_programming_question) }
      let(:language) { Coursemology::Polyglot::Language::Python::Python3Point10.instance }

      context 'when the language chosen is not whitelisted for evaluator' do
        let(:language) { Coursemology::Polyglot::Language::Python::Python2Point7.instance }
        it 'returns correct validation' do
          expect(subject_evaluator).to_not be_valid
          expect(subject_evaluator.errors.messages[:base]).to include('Language type must be either R, Java, ' \
                                                                      'or Python to activate either ' \
                                                                      'codaveri evaluator or live feedback')
        end
      end

      context 'when the language chosen is not whitelisted for live feedback' do
        let(:language) { Coursemology::Polyglot::Language::Python::Python2Point7.instance }
        it 'returns correct validation' do
          expect(subject_feedback).to_not be_valid
          expect(subject_feedback.errors.messages[:base]).to include('Language type must be either R, Java, ' \
                                                                     'or Python to activate either ' \
                                                                     'codaveri evaluator or live feedback')
        end
      end

      context 'when the codaveri component is disabled' do
        before { assessment.course.set_component_enabled_boolean!(:course_codaveri_component, false) }

        it 'returns correct validation' do
          skip
          expect(subject).to_not be_valid
          expect(subject.errors.messages[:base]).to include('Codaveri component is deactivated.' \
                                                            'Activate it in the course setting or ' \
                                                            'switch this question into a non-codaveri type.')
        end
      end
    end
  end
end
