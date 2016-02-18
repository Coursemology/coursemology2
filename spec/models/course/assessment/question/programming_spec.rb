# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::Programming do
  it { is_expected.to act_as(Course::Assessment::Question) }
  it { is_expected.to validate_numericality_of(:time_limit).allow_nil }
  it { is_expected.to validate_numericality_of(:memory_limit).allow_nil }

  it 'belongs to an import job' do
    expect(subject).to belong_to(:import_job).
      class_name(TrackableJob::Job.name)
  end

  it 'has many template files' do
    expect(subject).to have_many(:template_files).
      class_name(Course::Assessment::Question::ProgrammingTemplateFile.name).dependent(:destroy)
  end

  it 'has many test cases' do
    expect(subject).to have_many(:test_cases).
      class_name(Course::Assessment::Question::ProgrammingTestCase.name).dependent(:destroy)
  end

  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    describe 'callbacks' do
      let(:question_attributes) { [] }
      subject { build(:course_assessment_question_programming, *question_attributes) }

      describe 'before_save' do
        with_active_job_queue_adapter(:test) do
          before { subject.send(:clear_attribute_changes, :attachment) }

          context 'when a package is removed' do
            let(:question_attributes) do
              [{
                template_file_count: 1,
                template_package: true,
                import_job_id: SecureRandom.uuid
              }]
            end
            before { subject.attachment = nil }

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
            before do
              file = File.new(File.join(Rails.root, 'spec/fixtures/course/'\
                                                    'programming_question_template.zip'))
              subject.attachment = build(:attachment, file: file)
            end

            it 'queues a new import job' do
              expect(subject.import_job).to be_nil
              expect { subject.save }.to \
                have_enqueued_job(Course::Assessment::Question::ProgrammingImportJob).exactly(:once)
              expect(subject.import_job).not_to be_nil
            end

            it 'reverts the change to the attachment' do
              expect { subject.save }.to change { subject.attachment }.to(nil)
            end
          end
        end
      end
    end

    describe 'validations' do
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
      subject { build_stubbed(:course_assessment_question_programming, template_file_count: 1) }
      let(:assessment) { subject.assessment }
      let(:submission) { build_stubbed(:course_assessment_submission, assessment: assessment) }

      it 'returns an Answer' do
        expect(subject.attempt(submission)).to be_a(Course::Assessment::Answer)
      end

      it 'associates the answer with the submission' do
        answer = subject.attempt(submission)
        expect(submission.programming_answers).to include(answer.actable)
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
    end
  end
end
