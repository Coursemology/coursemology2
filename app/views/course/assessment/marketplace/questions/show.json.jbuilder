# frozen_string_literal: true
detail_partials = {
  'Course::Assessment::Question::MultipleResponse' => 'multiple_response',
  'Course::Assessment::Question::Programming' => 'programming',
  'Course::Assessment::Question::TextResponse' => 'text_response',
  'Course::Assessment::Question::RubricBasedResponse' => 'rubric_based_response',
  'Course::Assessment::Question::ForumPostResponse' => 'forum_post_response',
  'Course::Assessment::Question::VoiceResponse' => 'voice_response',
  'Course::Assessment::Question::Scribing' => 'scribing'
}

json.id @question.id
json.title @question.title
json.defaultTitle @question_assessment.default_title(@question_assessment.question_number)
json.description format_ckeditor_rich_text(@question.description)
json.staffOnlyComments format_ckeditor_rich_text(@question.staff_only_comments)
json.maximumGrade @question.maximum_grade
# `type` is the demodulized discriminator that drives the frontend renderer dispatch; keep it stable.
json.type @question.actable_type.demodulize
# `displayType` is the human-readable label shown in the detail header chip (mirrors the card).
json.displayType @question.question_type_readable

partial = detail_partials[@question.actable_type]
if partial
  json.detail do
    json.partial! "course/assessment/marketplace/questions/details/#{partial}", question: @question.actable
  end
else
  json.detail nil
end
