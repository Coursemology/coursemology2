# frozen_string_literal: true

json.array! @answers do |answer|
  json.id answer.id
  answer_creator = answer.submission.creator
  json.title answer_creator.course_users.find_by(course: current_course)&.name || answer_creator.name
  # Whether this is the submission's latest (current) attempt -- the same flag the past-answers views use --
  # so the frontend can show only the latest answer per student.
  json.currentAnswer answer.current_answer?
  json.submissionId answer.attempt_id
  json.submissionStatus answer.submission.workflow_state
  json.grade answer.grade.to_f if answer.evaluated? || answer.graded?
  # Show exactly what the LLM sees when grading (RBR: the response; forum post: the assembled posts + parent
  # context + response), so the playground tables mirror actual grading.
  json.answerText answer.grading_context_text
end
