# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Submission::SsidZipDownloadService do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:course_staff1) { create(:course_teaching_assistant, course: course) }
    let(:assessment) { create(:assessment, :published_with_programming_question, course: course) }
    let(:student1) { create(:course_user, course: course, name: 'Student') }
    let(:student2) { create(:course_user, course: course, name: 'Student') }

    let(:submission1) do
      create(:submission, :submitted, assessment: assessment, course: course, creator: student1.user)
    end

    let(:service) { described_class.new(assessment) }

    after { service.cleanup }

    describe '#download_to_base_dir' do
      let(:dir) { service.instance_variable_get(:@base_dir) }
      subject { service.send(:download_to_base_dir) }

      before do
        submission1
      end

      it 'downloads skeleton files and student submissions with correct directory names' do
        subject

        student1_folder = "#{submission1.id}_#{student1.name}"
        question = assessment.questions.first
        question_title = Pathname.normalize_filename(question.question_assessments.first.display_title)
        template_file = question.specific.template_files.first

        expect(Dir.exist?(File.join(dir, 'skeleton'))).to be_truthy
        expect(Dir.exist?(File.join(dir, student1_folder))).to be_truthy
        expect(Dir.exist?(File.join(dir, 'skeleton', question_title))).to be_truthy
        expect(File.exist?(File.join(dir, 'skeleton', question_title, template_file.filename))).to be_truthy
      end
    end

    describe '#download_and_zip' do
      subject { service.download_and_zip }

      before { submission1 }

      it 'generates zip files' do
        expect(subject).to be_an(Array)
        subject.each do |zip_file|
          expect(File.exist?(zip_file)).to be_truthy
        end
      end

      it 'cleans up temporary files after cleanup is called' do
        subject
        entries = service.send(:cleanup_entries)

        service.cleanup

        entries.each do |entry|
          expect(Pathname.new(entry).exist?).to be false
        end
      end
    end
  end
end
