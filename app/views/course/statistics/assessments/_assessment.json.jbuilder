# frozen_string_literal: true
json.id assessment.id
json.title assessment.title
json.startAt assessment.start_at&.iso8601
json.endAt assessment.end_at&.iso8601
json.maximumGrade assessment.maximum_grade
json.url course_assessment_path(course, assessment)
