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
