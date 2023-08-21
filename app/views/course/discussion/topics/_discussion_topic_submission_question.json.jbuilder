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
  creator = submission.creator
  user = @course_users_hash.fetch(creator.id, creator)
  json.id user.id
  json.userUrl url_to_user_or_course_user(current_course, user)
  json.name display_user(creator)
  json.imageUrl user_image(creator)
end

json.partial! 'topic', topic: topic, can_grade: can_grade

json.links do
  json.titleLink edit_course_assessment_submission_path(current_course, assessment, submission,
                                                        step: submission.questions.index(question) + 1)
end
