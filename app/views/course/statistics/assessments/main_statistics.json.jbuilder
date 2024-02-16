# frozen_string_literal: true
json.assessment do
  json.id @assessment.id
  json.isAutograded @assessment_autograded
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

  json.groups @group_names_hash[course_user.id]
  json.submissionExists !submission.nil?

  unless submission.nil?
    json.workflowState submission.workflow_state
    json.submittedAt submission.submitted_at&.iso8601
    json.endAt end_at&.iso8601
    json.totalGrade submission.grade

    json.attemptStatus answers.each do |answer|
      _, _, auto_gradable = @question_hash[answer.question_id]

      json.currentAnswerId answer.current_answer_id
      json.isAutograded auto_gradable
      json.attemptCount answer.attempt_count
      json.correct answer.correct
    end

    if submission.workflow_state == 'published' && submission.grader_ids
      # the graders are all the same regardless of question, so we just pick the first one
      grader = @course_users_hash[submission.grader_ids.first]
      json.grader do
        json.id grader&.id || 0
        json.name grader&.name || 'System'
      end

      json.answers answers.each do |answer|
        maximum_grade, question_type, _ = @question_hash[answer.question_id]

        json.currentAnswerId answer.current_answer_id
        json.grade answer.grade
        json.maximumGrade maximum_grade
        json.questionType question_type
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
