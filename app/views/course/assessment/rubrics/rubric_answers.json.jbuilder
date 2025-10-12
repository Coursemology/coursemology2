# frozen_string_literal: true

json.array! @answers do |answer|
  json.id answer.id
  answer_creator = answer.submission.creator
  json.title answer_creator.course_users.find_by(course: current_course)&.name || answer_creator.name
  json.grade answer.grade.to_f if answer.evaluated? || answer.graded?
  if answer.actable_type == Course::Assessment::Answer::RubricBasedResponse.name
    json.answerText answer.actable.answer_text
  end
end
