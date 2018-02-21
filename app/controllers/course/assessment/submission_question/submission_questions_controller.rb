# frozen_string_literal: true
class Course::Assessment::SubmissionQuestion::SubmissionQuestionsController < \
  Course::Assessment::SubmissionQuestion::Controller
  # Gets the 10 most recent past answers of a specific question
  def past_answers
    answers_to_load = past_answers_params[:answers_to_load] || 10
    answers = @submission_question.past_answers(answers_to_load)

    respond_to do |format|
      format.json { render 'past_answers', locals: { answers: answers } }
    end
  end

  private

  def past_answers_params
    params.permit(:answers_to_load)
  end
end
