# frozen_string_literal: true
json.assessment do
  json.id @assessment.id
  json.title @assessment.title
  json.startAt @assessment.start_at&.iso8601
  json.endAt @assessment.end_at&.iso8601
  json.maximumGrade @assessment.maximum_grade
  json.questionCount @assessment.question_count
  json.url course_assessment_path(current_course, @assessment)
end

json.submissions @student_submissions_hash.each do |course_user, (submission, answers, end_at)|
  json.courseUser do
    json.id course_user.id
    json.name course_user.name
    json.role course_user.role
    json.isPhantom course_user.phantom?
  end

  json.groups course_user.groups do |group|
    json.name group.name
  end

  json.submissionExists !submission.nil?

  if !submission.nil?
    json.workflowState submission.workflow_state
    json.submittedAt submission.submitted_at&.iso8601
    json.endAt end_at&.iso8601
    json.totalGrade submission.grade

    if submission.workflow_state == 'published' && submission.grader_ids
      # the graders are all the same regardless of question, so we just pick the first one
      grader = @course_users_hash[submission.grader_ids.first]
      json.grader do
        json.id grader&.id || 0
        json.name grader&.name || 'System'
      end

      json.answers answers.each do |answer|
        json.id answer.id
        json.grade answer.grade
        json.maximumGrade @question_maximum_grade_hash[answer.question_id]
      end
    end
  end
end

json.allStudents @all_students.each do |student|
  json.id student.id
  json.name student.name
  json.role student.role
  json.isPhantom student.phantom?
end

json.ancestors @ancestors do |ancestor|
  json.id ancestor.id
  json.title ancestor.title
  json.courseTitle ancestor.course&.title
end
