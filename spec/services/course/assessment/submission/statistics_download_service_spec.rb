# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Submission::StatisticsDownloadService do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:course_staff) { create(:course_teaching_assistant, course: course) }
    let(:assessment) { create(:assessment, :published_with_text_response_question, course: course) }
    let(:student1) { create(:course_user, course: course, name: 'Student') }
    let(:student2) { create(:course_user, course: course, name: 'Student 2') }

    let(:submission1) do
      create(:submission, :submitted, assessment: assessment,
                                      course: course, creator: student1.user)
    end

    let(:submission2) do
      create(:submission, :submitted, assessment: assessment,
                                      course: course, creator: student2.user)
    end

    describe '#generate' do
      context 'when downloading statistics' do
        it 'downloads empty statistics' do
          service = described_class.new(course, course_staff.user, nil)
          empty_path = service.generate
          expect(File.exist?(empty_path)).to be_truthy
          line_count = File.open(empty_path, 'r').readlines.size
          expect(line_count).to eq(1)
          service.cleanup
        end

        it 'downloads non-empty statistics' do
          submission_ids = [submission1.id, submission2.id]
          service = described_class.new(course, course_staff.user, submission_ids)
          non_empty_path = service.generate
          expect(File.exist?(non_empty_path)).to be_truthy
          line_count = File.open(non_empty_path, 'r').readlines.size
          expect(line_count).to eq(1 + submission_ids.length)
          service.cleanup
        end

        it 'cleans up temporary files after cleanup is called' do
          submission_ids = [submission1.id, submission2.id]
          service = described_class.new(course, course_staff.user, submission_ids)
          service.generate
          entries = service.send(:cleanup_entries)

          service.cleanup

          entries.each do |entry|
            expect(Pathname.new(entry).exist?).to be false
          end
        end
      end
    end
  end
end
