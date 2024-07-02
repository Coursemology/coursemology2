# frozen_string_literal: true
class Course::Assessment::SkillBranchesController < Course::ComponentController
  load_and_authorize_resource :skill_branch, class: 'Course::Assessment::SkillBranch',
                                             through: :course,
                                             through_association: :assessment_skill_branches

  def create
    if @skill_branch.save
      render '_skill_branch_list_data', locals: { skill_branch: @skill_branch }, status: :ok
    else
      render json: { errors: @skill_branch.errors }, status: :bad_request
    end
  end

  def update
    if @skill_branch.update(skill_branch_params)
      render '_skill_branch_list_data', locals: { skill_branch: @skill_branch }, status: :ok
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
