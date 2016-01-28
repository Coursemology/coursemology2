# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::ProgrammingImportJob do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    subject { Course::Assessment::Question::ProgrammingImportJob }
    let(:question) do
      create(:course_assessment_question_programming, template_file_count: 0)
    end
    let(:attachment) do
      create(:attachment,
             file: File.join(Rails.root, 'spec/fixtures/course/programming_question_template.zip'),
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
  end
end
