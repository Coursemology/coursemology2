# frozen_string_literal: true

topic = file_annotation.acting_as
answer = file_annotation.file.answer
question = answer.question
submission = answer.submission
assessment = submission.assessment
question_assessment = assessment.question_assessments.find_by!(question: question)

json.id topic.id
json.title "#{assessment.title}: #{question_assessment.display_title}"
json.creator do
  user = submission.creator
  json.id user.id
  json.name display_user(user)
  json.imageUrl user.profile_photo.url
end
json.content display_code_lines(file_annotation.file, file_annotation.line - 5, file_annotation.line)

json.partial! 'topic', topic: topic

# TODO: remove links, change to frontend if possible
json.links do
  json.titleLink edit_course_assessment_submission_path(current_course, assessment, submission,
                                                        step: submission.questions.index(question) + 1)
end
