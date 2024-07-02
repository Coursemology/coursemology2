# frozen_string_literal: true
class Course::Assessment::SkillsController < Course::ComponentController
  load_and_authorize_resource :skill, class: 'Course::Assessment::Skill', through: :course,
                                      through_association: :assessment_skills
  before_action :load_skill_branches

  def index
    @skills = @skills.includes(:skill_branch).group_by(&:skill_branch)
    respond_to do |format|
      format.json { render 'index' }
    end
  end

  def create
    if @skill.save
      render '_skill_list_data', locals: { skill: @skill }, status: :ok
    else
      render json: { errors: @skill.errors }, status: :bad_request
    end
  end

  def update
    if @skill.update(skill_params)
      render '_skill_list_data', locals: { skill: @skill }, status: :ok
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
