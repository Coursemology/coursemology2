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
      redirect_to course_assessments_skills_path(current_course),
                  success: t('.success', title: @skill_branch.title)
    else
      render 'new'
    end
  end

  def edit
  end

  def update
    if @skill_branch.update_attributes(skill_branch_params)
      redirect_to course_assessments_skills_path(current_course),
                  success: t('.success', title: @skill_branch.title)
    else
      render 'edit'
    end
  end

  def destroy
    if @skill_branch.destroy
      redirect_to course_assessments_skills_path(current_course),
                  success: t('.success', skill: @skill_branch.title)
    else
      redirect_to course_assessments_skills_path(current_course),
                  danger: t('.failure', error: @skill_branch.errors.full_messages.to_sentence)
    end
  end

  private

  def skill_branch_params
    params.require(:skill_branch).permit(:title, :description)
  end
end
