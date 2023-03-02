# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::ProgrammingImportJob do
  let(:instance_traits) { nil }
  let!(:instance) { create(:instance, *instance_traits) }

  with_tenant(:instance) do
    subject { Course::Assessment::Question::ProgrammingImportJob }
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
      expect { subject.perform_later(question, attachment) }.to \
        have_enqueued_job(subject).exactly(:once)
    end

    it 'imports the templates' do
      subject.perform_now(question, attachment)
      expect(question.template_files).not_to be_empty
    end

    it 'imports the test cases' do
      subject.perform_now(question, attachment)
      expect(question.test_cases).not_to be_empty
    end

    it 'does not create codaveri question' do
      subject.perform_now(question, attachment)

      wait_for_job

      expect(question.codaveri_id).to eq(nil)
      expect(question.codaveri_status).to eq(nil)
      expect(question.codaveri_message).to eq(nil)
    end

    context 'when the codaveri component is enabled' do
      let(:course) { create(:course, *course_traits) }
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

      let(:instance_traits) { :with_codaveri_component_enabled }
      let(:course_traits) { :with_codaveri_component_enabled }

      before do
        Course::Assessment::StubbedProgrammingEvaluationService.class_eval do
          prepend Course::Assessment::StubbedProgrammingEvaluationServiceForCodaveriTest
        end
      end

      after do
        Course::Assessment::ProgrammingEvaluationService.class_eval do
          prepend Course::Assessment::StubbedProgrammingEvaluationService
        end
      end

      it 'creates codaveri question' do
        subject.perform_now(question, attachment)

        wait_for_job

        expect(question.codaveri_id).to eq('6311a0548c57aae93d260927')
        expect(question.codaveri_status).to eq(200)
        expect(question.codaveri_message).to eq('Problem successfully created')
      end
    end
  end
end
