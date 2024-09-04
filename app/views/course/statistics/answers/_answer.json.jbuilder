# frozen_string_literal: true
specific_answer = answer.specific

json.id answer.id
json.grade answer.grade
json.questionType question.question_type
json.partial! specific_answer, answer: specific_answer, can_grade: false

if answer.actable_type == Course::Assessment::Answer::Programming.name
  files = answer.specific.files
  json.partial! 'course/assessment/answer/programming/annotations', programming_files: files,
                                                                    can_grade: false
  posts = files.flat_map(&:annotations).map(&:discussion_topic).flat_map(&:posts)

  json.posts posts do |post|
    json.partial! post, post: post if post.published?
  end
end
