# frozen_string_literal: true
class Course::Assessment::Submission::Answer::RubricBasedResponse::Controller <
  Course::Assessment::Submission::Answer::Controller
  private

  def set_rubric_based_response_answer
    @rubric_based_response_answer = @actable
    remove_instance_variable(:@actable)
  end
end
