require 'rails_helper'

RSpec.describe Course::Assessment::Question::Programming do
  it { is_expected.to act_as(:question) }
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
      subject { build(:course_assessment_question_programming) }

      describe 'after_save' do
        context 'when a new package is uploaded' do
          with_active_job_queue_adapter(:test) do
            it 'queues a new import job' do
              expect(subject.import_job).to be_nil
              subject.file = File.new(File.join(Rails.root, 'spec/fixtures/course/'\
                                                            'programming_question_template.zip'),
                                      'rb')
              expect { subject.save }.to \
                have_enqueued_job(Course::Assessment::Question::ProgrammingImportJob).exactly(:once)
            end
          end
        end
      end
    end

    describe 'validations' do
    end

    describe '#attempt' do
      subject { build_stubbed(:course_assessment_question_programming) }
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
