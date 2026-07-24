# frozen_string_literal: true

class Course::Assessment::Submission::Answer::AnswersController <
  Course::Assessment::Submission::Answer::Controller
  include Course::Assessment::SubmissionConcern
  include Course::Assessment::Answer::UpdateAnswerConcern
  include Course::Assessment::Answer::SubmitAnswerConcern

  before_action :authorize_submission!
  before_action :check_password, only: [:update]

  def show
    authorize! :read, @answer
  end

  def update
    authorize! :update, @answer

    if update_answer(@answer, answer_params)
      render @answer
    else
      render json: { errors: @answer.errors }, status: :bad_request
    end
  end

  def submit_answer
    authorize! :submit_answer, @answer

    if update_answer(@answer, answer_params)
      if should_auto_grade_on_submit(@answer)
        auto_grade_answer(@answer)
      else
        render @answer
      end
    else
      render json: { errors: @answer.errors }, status: :bad_request
    end
  end

  protected

  def answer_params
    params.require(:answer)
  end
end
