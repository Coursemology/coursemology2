# frozen_string_literal: true
class Course::Survey::SectionsController < Course::Survey::SurveysController
  load_and_authorize_resource :section, through: :survey, class: Course::Survey::Section.name

  def create
    last_weight = @survey.sections.maximum(:weight)
    @section.weight = last_weight ? last_weight + 1 : 0
    if @section.save
      render_section_json
    else
      render json: { errors: @section.errors }, status: :bad_request
    end
  end

  def update
    if @section.update_attributes(section_params)
      render_section_json
    else
      render json: { errors: @section.errors }, status: :bad_request
    end
  end

  def destroy
    if @section.destroy
      head :ok
    else
      head :bad_request
    end
  end

  private

  def load_questions
    @questions ||= @section.questions.includes(options: { attachment_references: :attachment })
  end

  def render_section_json
    load_questions
    render partial: 'section', locals: { section: @section }
  end

  def section_params
    params.require(:section).permit(:title, :description)
  end
end
