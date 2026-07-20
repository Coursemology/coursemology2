# frozen_string_literal: true
class Course::Assessment::MockAnswersController < Course::Assessment::QuestionsController
  load_and_authorize_resource :mock_answer, class: 'Course::Assessment::Question::MockAnswer', through: :question

  def create
    @mock_answer.question = @question
    if @mock_answer.save
      # Renders the created mock answer, including each grading context's join-row id, so the client can send
      # those ids back on a later update (nested attributes then update in place instead of inserting a dup).
      render 'show', status: :ok
    else
      render json: { errors: @mock_answer.errors }, status: :bad_request
    end
  end

  def update
    if @mock_answer.update(mock_answer_params)
      render 'show', status: :ok
    else
      render json: { errors: @mock_answer.errors }, status: :bad_request
    end
  end

  def destroy
    # `dependent: :destroy` on the mock answer's grading_contexts (backed by an on_delete: :cascade FK)
    # removes the author-supplied context rows tied to this answer.
    if @mock_answer.destroy
      head :ok
    else
      render json: { errors: @mock_answer.errors }, status: :bad_request
    end
  end

  private

  def mock_answer_params
    params.require(:mock_answer).permit(
      :name,
      :answer_text,
      grading_contexts_attributes: [:id, :grading_context_id, :content]
    )
  end
end
