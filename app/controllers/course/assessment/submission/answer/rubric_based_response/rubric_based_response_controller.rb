# frozen_string_literal: true
class Course::Assessment::Submission::Answer::RubricBasedResponse::RubricBasedResponseController <
  Course::Assessment::Submission::Answer::RubricBasedResponse::Controller
  load_resource :actable, class: 'Course::Assessment::Answer::RubricBasedResponse',
                          singleton: true, through: :answer
  before_action :set_rubric_based_response_answer

  def update_score
    submission = @rubric_based_response_answer.answer.submission
    authorize! :update_category_score, submission

    category_score = Course::Assessment::Answer::RubricBasedResponseScore.find(score_params[:id])

    if category_score.update(score: score_params[:score])
      head :ok
    else
      head :bad_request
    end
  end

  def update_explanation
    submission = @rubric_based_response_answer.answer.submission
    authorize! :update_category_explanations, submission

    category_explanation = Course::Assessment::Answer::RubricBasedResponseScore.find(explanation_params[:id])

    if category_explanation.update(explanation: explanation_params[:explanation])
      head :ok
    else
      head :bad_request
    end
  end

  private

  def score_params
    params.require(:category_score).permit(:id, :score)
  end

  def explanation_params
    params.require(:category_explanation).permit(:id, :explanation)
  end
end
