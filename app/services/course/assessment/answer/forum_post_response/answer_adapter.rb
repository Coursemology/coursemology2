# frozen_string_literal: true
# See Course::Assessment::Answer::RubricGrading::AnswerAdapter for the shared save pipeline. A forum-post
# response is graded on the student's own text response (if the question enables one) plus each selected
# forum post -- prefixed with the parent post it replies to, for context -- so the rubric can assess the
# student's forum contributions.
class Course::Assessment::Answer::ForumPostResponse::AnswerAdapter <
  Course::Assessment::Answer::RubricGrading::AnswerAdapter
  def answer_text
    segments = []
    @answer.post_packs.each_with_index do |pack, index|
      segments << format_post_pack(pack, index + 1)
    end
    segments << @answer.answer_text unless @answer.answer_text.blank?
    segments.join("\n\n")
  end

  private

  def format_post_pack(pack, position)
    lines = []
    lines << "In reply to: #{pack.parent_text}" if pack.parent_text.present?
    lines << pack.post_text
    lines.join("\n")
  end
end
