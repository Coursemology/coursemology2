# frozen_string_literal: true
# See Course::Assessment::Answer::RubricGrading::AnswerAdapter for the shared save pipeline. A forum-post
# response is graded on the student's own text response (if the question enables one) plus each selected
# forum post -- prefixed with the parent post it replies to, for context -- so the rubric can assess the
# student's forum contributions.
class Course::Assessment::Answer::ForumPostResponse::AnswerAdapter <
  Course::Assessment::Answer::RubricGrading::AnswerAdapter
  # Same assembled text (selected posts + the student's response) used when this answer feeds another
  # question's grading, so the two paths never drift.
  def answer_text
    @answer.grading_context_text
  end
end
