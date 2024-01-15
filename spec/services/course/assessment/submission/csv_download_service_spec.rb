# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Submission::CsvDownloadService do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:course_staff) { create(:course_teaching_assistant, course: course) }
    let!(:student1) { create(:course_user, course: course, name: 'Student 1') }
    let!(:student2) { create(:course_user, course: course, name: 'Student 2') }
    let!(:student3) { create(:course_user, course: course, name: 'Student 3') }
    let!(:assessment1) { create(:assessment, :published_with_all_question_types, course: course) }
    let!(:assessment2) do
      create(:assessment, :published_with_all_question_types, :with_illegal_characters_in_title,
             course: course)
    end
    let!(:submission1) do
      create(:submission, :submitted, assessment: assessment1,
                                      course: course, creator: student1.user)
    end
    let!(:submission2) do
      create(:submission, :submitted, assessment: assessment1,
                                      course: course, creator: student2.user)
    end

    describe '#download' do
      subject do
        Course::Assessment::Submission::CsvDownloadService.send(:download, course_staff, assessment1, nil)
      end

      context 'when there are submissions' do
        let!(:filepath) { subject }
        let!(:csv_lines) { CSV.open(filepath, 'r').readlines }

        it 'downloads non-empty csv' do
          # Check row and column numbers
          expect(csv_lines.size).to eq(3 + course.course_users.students.length)
          # 3 is the number of header rows

          expect(csv_lines.fifth.size).to eq(5 + submission1.questions.length)
          # 5 is the number of initial columns (e.g. name, email, role etc)

          # Csv header - question type
          question_types = assessment1.questions.map(&:question_type_readable)
          csv_header_question_types = csv_lines[1].slice(5..)
          expect(csv_header_question_types).to eq(question_types)

          # Csv body - student 1 answers
          csv_body_answers = csv_lines[3]
          expect(csv_body_answers).to include(student1.name)
          expect(csv_body_answers).to include(student1.role)
          expect(csv_body_answers).to include(submission1.workflow_state)
        end
      end

      context 'when assessment contains illegal characters in name' do
        let!(:filepath) do
          Course::Assessment::Submission::CsvDownloadService.send(:download,
                                                                  course_staff,
                                                                  assessment2,
                                                                  nil)
        end
        it 'downloads non-empty csv with normalized name' do
          expect(File.exist?(filepath)).to be_truthy
          normalized_assessment_title = Pathname.normalize_filename(assessment2.title)
          expect(filepath).to include("#{normalized_assessment_title}.csv")
        end
      end
    end
  end
end
