# frozen_string_literal: true
class Course::Assessment::SkillsController < Course::ComponentController
  load_and_authorize_resource :skill, class: Course::Assessment::Skill.name, through: :course,
                                      through_association: :assessment_skills
  before_action :load_skill_branches
  add_breadcrumb :index, :course_assessments_skills_path

  def index
    respond_to do |format|
      format.html { render 'index' }
      format.json { render partial: 'index' }
    end
  end

  def new
  end

  def create
    if @skill.save
      render json: { id: @skill.id, canUpdate: can?(:update, @skill), canDestroy: can?(:destroy, @skill) }, status: :ok
    else
      render json: { errors: @skill.errors }, status: :bad_request
    end
  end

  def edit
  end

  def update
    if @skill.update(skill_params)
      render json: { id: @skill.id, canUpdate: can?(:update, @skill), canDestroy: can?(:destroy, @skill) }, status: :ok
    else
      render json: { errors: @skill.errors }, status: :bad_request
    end
  end

  def destroy
    if @skill.destroy
      head :ok
    else
      head :bad_request
    end
  end

  def options
    respond_to do |format|
      format.json { render partial: 'options' }
    end
  end

  private

  def skill_params
    params.require(:skill).permit(:title, :description, :skill_branch_id)
  end

  def load_skill_branches
    @skill_branches = current_course.assessment_skill_branches.
                      accessible_by(current_ability).ordered_by_title
  end

  # @return [Course::AssessmentsComponent]
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_assessments_component]
  end
end
