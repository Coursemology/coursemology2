# frozen_string_literal: true
class Course::Assessment::SkillBranchesController < Course::ComponentController
  load_and_authorize_resource :skill_branch, class: Course::Assessment::SkillBranch.name,
                                             through: :course,
                                             through_association: :assessment_skill_branches
  add_breadcrumb :index, :course_assessments_skills_path

  def new
  end

  def create
    if @skill_branch.save
      render json: { id: @skill_branch.id, canUpdate: can?(:update, @skill_branch),
                     canDestroy: can?(:destroy, @skill_branch) }, status: :ok
    else
      render json: { errors: @skill_branch.errors }, status: :bad_request
    end
  end

  def edit
  end

  def update
    if @skill_branch.update(skill_branch_params)
      render json: { id: @skill_branch.id, canUpdate: can?(:update, @skill_branch),
                     canDestroy: can?(:destroy, @skill_branch) }, status: :ok
    else
      render json: { errors: @skill_branch.errors }, status: :bad_request
    end
  end

  def destroy
    if @skill_branch.destroy
      head :ok
    else
      head :bad_request
    end
  end

  private

  def skill_branch_params
    params.require(:skill_branch).permit(:title, :description)
  end

  # @return [Course::AssessmentsComponent]
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_assessments_component]
  end
end
