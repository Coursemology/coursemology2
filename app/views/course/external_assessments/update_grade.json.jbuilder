# frozen_string_literal: true
json.studentId @grade.course_user.user_id
json.assessmentId(-@grade.external_assessment_id)
json.grade @grade.grade&.to_f
