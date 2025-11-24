# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::ExperiencePointsDownloadService do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let!(:student1) { create(:course_user, course: course, name: 'Student 1') }
    let!(:student2) { create(:course_user, course: course, name: 'Student 2') }
    let!(:manual_record1) { create(:course_experience_points_record, course_user: student1) }
    let!(:manual_record2) { create(:course_experience_points_record, course_user: student1) }
    let!(:manual_record3) { create(:course_experience_points_record, course_user: student2) }

    let(:assessment) { create(:assessment, course: course, end_at: 3.days.from_now, published: true) }
    let(:survey) { create(:survey, course: course) }

    let!(:record) do
      create(:submission, assessment: assessment, creator: student1.user,
                          course_user: student1, points_awarded: 200).acting_as
    end

    let!(:record2) do
      create(:response, survey: survey, creator: student2.user,
                        course_user: student2, points_awarded: 300).acting_as
    end

    describe '#generate' do
      subject { service.generate }
      let(:service) { described_class.new(course, course_user_id) }
      after { service.cleanup }

      context 'when there are existing records and no filtering of student' do
        let(:course_user_id) { nil }
        let!(:filepath) { subject }
        let!(:csv_lines) { CSV.open(filepath, 'r').readlines }

        it 'downloads non-empty csv' do
          expect(csv_lines.size).to eq(6)

          # one of the survey-induced record of the student's exp points
          csv_exp_point_record = csv_lines[1]
          expect(csv_exp_point_record).to include(student2.name)
          expect(csv_exp_point_record).to include(record2.points_awarded.to_s)
          expect(csv_exp_point_record).to include(survey.title)

          # one of the manually awarded record of student's exp points
          csv_manual_exp_point_record = csv_lines[3]
          expect(csv_manual_exp_point_record).to include(student2.name)
          expect(csv_manual_exp_point_record).to include(manual_record3.points_awarded.to_s)
          expect(csv_manual_exp_point_record).to include(manual_record3.reason)
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

      context 'when there are existing records and also filter for student' do
        let(:course_user_id) { student1.id }
        let!(:filepath) { subject }
        let!(:csv_lines) { CSV.open(filepath, 'r').readlines }

        it 'downloads non-empty csv only for student 1' do
          expect(csv_lines.size).to eq(4)

          # one of the record of the student's exp points
          csv_exp_point_record = csv_lines[1]
          expect(csv_exp_point_record).to include(student1.name)
          expect(csv_exp_point_record).to include(record.points_awarded.to_s)
          expect(csv_exp_point_record).to include(assessment.title)
        end
      end
    end
  end
end
