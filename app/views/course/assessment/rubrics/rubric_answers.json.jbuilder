# frozen_string_literal: true

json.array! @answers do |answer|
  json.id answer.id
  answer_creator = answer.submission.creator
  json.title answer_creator.course_users.find_by(course: current_course)&.name || answer_creator.name
  # Whether this is the submission's latest (current) attempt -- the same flag the past-answers views use --
  # so the frontend can show only the latest answer per student.
  json.currentAnswer answer.current_answer?
  json.submissionId answer.submission_id
  json.submissionStatus answer.submission.workflow_state
  json.grade answer.grade.to_f if answer.evaluated? || answer.graded?
  if answer.actable_type == Course::Assessment::Answer::RubricBasedResponse.name
    json.answerText answer.actable.answer_text
  end
end
