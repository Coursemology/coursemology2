# frozen_string_literal: true
class Course::Assessment::Question::ForumPostResponsesController < Course::Assessment::Question::Controller
  build_and_authorize_new_question :forum_post_response_question,
                                   class: Course::Assessment::Question::ForumPostResponse, only: [:new, :create]
  load_and_authorize_resource :forum_post_response_question,
                              class: 'Course::Assessment::Question::ForumPostResponse',
                              through: :assessment, parent: false, except: [:new, :create]
  before_action :load_question_assessment, only: [:edit, :update]

  def create
    if @forum_post_response_question.save
      render json: { redirectUrl: course_assessment_path(current_course, @assessment) }
    else
      render json: { errors: @forum_post_response_question.errors }, status: :bad_request
    end
  end

  def edit
    @forum_post_response_question.description = helpers.format_ckeditor_rich_text(@forum_post_response_question.description)
  end

  def update
    update_skill_ids_if_params_present(forum_post_response_question_params[:question_assessment])

    if update_forum_post_response_question
      render json: { redirectUrl: course_assessment_path(current_course, @assessment) }
    else
      render json: { errors: @forum_post_response_question.errors }, status: :bad_request
    end
  end

  def destroy
    if @forum_post_response_question.destroy
      head :ok
    else
      error = @forum_post_response_question.errors.full_messages.to_sentence
      render json: { errors: error }, status: :bad_request
    end
  end

  private

  def update_forum_post_response_question
    @forum_post_response_question.update(forum_post_response_question_params.except(:question_assessment))
  end

  def forum_post_response_question_params
    permitted_params = [
      :title, :description, :staff_only_comments, :maximum_grade, :has_text_response, :max_posts,
      question_assessment: { skill_ids: [] }
    ]
    params.require(:question_forum_post_response).permit(*permitted_params)
  end

  def load_question_assessment
    @question_assessment = load_question_assessment_for(@forum_post_response_question)
  end
end
