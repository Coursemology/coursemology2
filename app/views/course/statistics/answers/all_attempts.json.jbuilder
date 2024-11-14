# frozen_string_literal: true
is_displayed = @submission.graded? || @submission.published?

json.isAnswersDisplayed is_displayed

if is_displayed
  json.user do
    json.name @submission.creator.name
    json.id @submission.creator.id
  end

  json.partial! 'details'

  json.submissionId @submission.id
end
