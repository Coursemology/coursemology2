# frozen_string_literal: true

topic = submission_question.acting_as
question = submission_question.question
submission = submission_question.submission
assessment = submission.assessment
question_assessment = assessment.question_assessments.find_by!(question: question)
can_grade = can?(:grade, submission)

json.id topic.id
json.title "#{assessment.title}: #{question_assessment.display_title}"
json.creator do
  user = submission.creator
  json.id user.id
  json.name display_user(user)
  json.imageUrl user.profile_photo.url
end

json.partial! 'topic', topic: topic, can_grade: can_grade

json.links do
  json.titleLink edit_course_assessment_submission_path(current_course, assessment, submission,
                                                        step: submission.questions.index(question) + 1)
end
