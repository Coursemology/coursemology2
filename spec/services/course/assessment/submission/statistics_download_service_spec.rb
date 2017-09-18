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

    describe '#download' do
      context 'when downloading statistics' do
        it 'download empty statistics' do
          empty_path = Course::Assessment::Submission::StatisticsDownloadService.
                       send(:download, course_staff.user, nil)
          expect(File.exist?(empty_path)).to be_truthy
          line_count = File.open(empty_path, 'r').readlines.size
          expect(line_count).to eq(1)
        end

        it 'download non-empty statistics' do
          submission_ids = [submission1.id, submission2.id]
          non_empty_path = Course::Assessment::Submission::StatisticsDownloadService.
                           send :download, course_staff.user, submission_ids
          expect(File.exist?(non_empty_path)).to be_truthy
          line_count = File.open(non_empty_path, 'r').readlines.size
          expect(line_count).to eq(1 + submission_ids.length)
        end
      end
    end
  end
end
