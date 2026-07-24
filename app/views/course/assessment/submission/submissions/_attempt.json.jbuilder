# frozen_string_literal: true
json.id attempt.id
json.canGrade can_grade
json.canUpdate can_update
json.isCreator current_user.id == attempt.creator_id
json.isStudent current_course_user&.student? || false

if assessment.autograded? && !assessment.skippable?
  question = attempt.questions.next_unanswered(attempt)
  # If question does not exist, means the student have answered all questions
  json.maxStep attempt.questions.index(question) if question
end

# Show submission as submitted to students if grading is not published yet
apparent_workflow_state = if cannot?(:grade, attempt) && attempt.graded?
                            'submitted'
                          else
                            attempt.workflow_state
                          end

json.workflowState apparent_workflow_state
json.attemptedAt attempt.created_at&.iso8601
json.submittedAt attempt.submitted_at&.iso8601
json.maximumGrade attempt.questions.sum(:maximum_grade).to_f

json.showPublicTestCasesOutput current_course.show_public_test_cases_output
json.showStdoutAndStderr current_course.show_stdout_and_stderr
