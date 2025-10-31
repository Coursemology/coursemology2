# frozen_string_literal: true

assessment = assessments_hash[submission.assessment_id]
course_user = submission.course_user

json.id submission.id

json.courseUserId course_user.id
json.courseUserName course_user.name

json.assessmentId assessment.id
json.assessmentPublished assessment.published?
json.assessmentTitle assessment.title

json.submittedAt submission.submitted_at

json.status submission.workflow_state

if pending
  json.teachingStaff @service.group_managers_of(course_user) do |manager|
    json.teachingStaffId manager.id
    json.teachingStaffName manager.name
  end
end

can_see_grades = submission.published? || (submission.graded? && can?(:grade, submission.assessment))

if can_see_grades
  json.currentGrade submission.grade
  json.maxGrade assessment.maximum_grade
  json.isGradedNotPublished submission.graded?

  json.pointsAwarded submission.current_points_awarded if is_gamified

else
  json.maxGrade assessment.maximum_grade
end

json.permissions do
  json.canSeeGrades can_see_grades
  json.canGrade current_course_user&.teaching_staff? && submission.submitted?
end
