# frozen_string_literal: true
class Course::Assessment::Submission::Answer::AnswersController < \
  Course::Assessment::Submission::Answer::Controller

  def show
    render @answer, locals: { can_grade: can?(:grade, @submission) }
  end
end
