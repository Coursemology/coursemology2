# frozen_string_literal: true
class Course::Assessment::Submission::Answer::Programming::Controller < \
  Course::Assessment::Submission::Answer::Controller
  private

  def set_programming_answer
    @programming_answer = @actable
    remove_instance_variable(:@actable)
  end
end
