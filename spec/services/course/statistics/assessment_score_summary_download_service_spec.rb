# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Statistics::AssessmentsScoreSummaryDownloadService do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let!(:course) { create(:course) }
    let!(:course2) { create(:course) }
    let!(:student1) { create(:course_user, course: course, name: 'Student 1') }
    let!(:student2) { create(:course_user, :phantom, course: course, name: 'Student 2') }
    let!(:student3) { create(:course_user, course: course, name: 'Student 3') }
    let!(:student4) { create(:course_user, course: course2, name: 'Student 4') }

    let!(:assessment1) do
      create(:assessment, :published_with_mrq_question, course: course, end_at: 3.days.from_now, published: true)
    end
    let!(:assessment2) do
      create(:assessment, :published_with_text_response_question, course: course, end_at: 3.days.from_now,
                                                                  published: true)
    end
    let!(:assessment3) do
      create(:assessment, :published_with_text_response_question, course: course2, end_at: 3.days.from_now,
                                                                  published: true)
    end

    let!(:submission11) { create(:submission, :published, assessment: assessment1, creator: student1.user) }
    let!(:submission12) { create(:submission, :published, assessment: assessment2, creator: student1.user) }

    let!(:submission21) { create(:submission, :published, assessment: assessment1, creator: student2.user) }
    let!(:submission22) { create(:submission, :published, assessment: assessment2, creator: student2.user) }

    describe '#download' do
      subject do
        file_name = "#{Pathname.normalize_filename(course.title)}_score_summary_" \
                    "#{Time.now.strftime '%Y-%m-%d %H%M'}.csv"
        assessment_ids_list = [assessment1.id, assessment2.id, assessment3.id]
        Course::Statistics::AssessmentsScoreSummaryDownloadService.send(:download, course,
                                                                        assessment_ids_list,
                                                                        file_name)
      end

      context 'when all assessments are chosen for score summary export' do
        let!(:filepath) { subject }
        let!(:csv_lines) { CSV.open(filepath, 'r').readlines }

        it 'downloads non-empty csv with correct information' do
          expect(csv_lines.size).to eq(4)
          expect(csv_lines[0].size).to eq(5)

          first_student_record = csv_lines[1]
          expect(first_student_record[0]).to eq(student1.name)
          expect(first_student_record[1]).to eq(student1.user.email)
          expect(first_student_record[2]).to eq(student1.phantom? ? 'phantom' : 'normal')
          expect(first_student_record[3]).to eq(submission11.grade.to_s)
          expect(first_student_record[4]).to eq(submission12.grade.to_s)

          second_student_record = csv_lines[2]
          expect(second_student_record[0]).to eq(student2.name)
          expect(second_student_record[1]).to eq(student2.user.email)
          expect(second_student_record[2]).to eq(student2.phantom? ? 'phantom' : 'normal')
          expect(second_student_record[3]).to eq(submission21.grade.to_s)
          expect(second_student_record[4]).to eq(submission22.grade.to_s)

          third_student_record = csv_lines[3]
          expect(third_student_record[0]).to eq(student3.name)
          expect(third_student_record[1]).to eq(student3.user.email)
          expect(third_student_record[2]).to eq(student3.phantom? ? 'phantom' : 'normal')
          expect(third_student_record[3]).to eq('')
          expect(third_student_record[4]).to eq('')
        end
      end
    end
  end
end
