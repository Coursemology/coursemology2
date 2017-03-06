# frozen_string_literal: true
class Course::Survey::SurveysController < Course::ComponentController
  load_and_authorize_resource :survey, through: :course, class: Course::Survey.name
  add_breadcrumb :index, :course_surveys_path

  def index
    respond_to do |format|
      format.html
      format.json
    end
  end

  def create
    if @survey.save
      render partial: 'survey', locals: { survey: @survey }
    else
      render json: { errors: @survey.errors }, status: :bad_request
    end
  end

  def show
    respond_to do |format|
      format.html { render 'index' }
      format.json { preload_questions_show }
    end
  end

  def update
    if @survey.update_attributes(survey_params)
      preload_questions_show
    else
      render json: { errors: @survey.errors }, status: :bad_request
    end
  end

  def destroy
    if @survey.destroy
      head :ok
    else
      head :bad_request
    end
  end

  def results
    respond_to do |format|
      format.html { render 'index' }
      format.json { preload_questions_results }
    end
  end

  private

  def preload_questions_show
    @questions ||= @survey.questions.accessible_by(current_ability).includes(:options)
  end

  def preload_questions_results
    @questions ||= @survey.questions.includes(
      [options: { attachment_references: :attachment },
       answers: [:options, response: { experience_points_record: :course_user }]]
    )
  end

  def survey_params
    params.require(:survey).
      permit(:title, :description, :base_exp, :start_at, :end_at, :published)
  end
end
