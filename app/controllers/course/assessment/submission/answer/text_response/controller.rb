# frozen_string_literal: true
class Course::Assessment::Submission::Answer::TextResponse::Controller < \
  Course::Assessment::Submission::Answer::Controller
  private

  def set_text_response_answer
    @text_response_answer = @actable
    remove_instance_variable(:@actable)
  end
end
