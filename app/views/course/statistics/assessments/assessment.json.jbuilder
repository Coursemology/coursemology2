# frozen_string_literal: true
json.assessment do
  json.id @assessment.id
  json.startAt @assessment.start_at&.iso8601
  json.endAt @assessment.end_at&.iso8601
  json.maximumGrade @assessment.maximum_grade
end

json.submissions @submission_records do |record|
  json.courseUser do
    json.id record[0].id
    json.name record[0].name
    json.role record[0].role
    json.isPhantom record[0].phantom?
  end

  json.submittedAt record[1]&.iso8601
  json.endAt record[2]&.iso8601
  json.grade record[3]
end

json.allStudents @all_students do |student|
  json.id student.id
  json.name student.name
  json.role student.role
  json.isPhantom student.phantom?
end
