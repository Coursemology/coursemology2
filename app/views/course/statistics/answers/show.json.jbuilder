# frozen_string_literal: true
specific_answer = @answer.specific
question = @answer.question

json.id @answer.id
json.grade @answer.grade
json.createdAt @answer.created_at&.iso8601

# this section is here because the answer can affect how the question is displayed
# e.g. option randomization for mcq/mrq questions
json.question do
  json.id question.id
  json.title question.title
  json.maximumGrade question.maximum_grade
  json.description format_ckeditor_rich_text(question.description)
  json.type question.question_type

  json.partial! question, question: question.specific, can_grade: false, answer: @answer
end
json.partial! specific_answer, answer: specific_answer, can_grade: false

if @answer.actable_type == Course::Assessment::Answer::Programming.name
  files = @answer.specific.files
  json.partial! 'course/assessment/answer/programming/annotations', programming_files: files,
                                                                    can_grade: false
  posts = files.flat_map(&:annotations).map(&:discussion_topic).flat_map(&:posts)

  json.posts posts do |post|
    json.partial! post, post: post if post.published?
  end
end
