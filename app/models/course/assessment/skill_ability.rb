# frozen_string_literal: true
module Course::Assessment::SkillAbility
  def define_permissions
    if user
      allow_staff_manage_skills
      allow_staff_manage_skill_branches
    end

    super
  end

  private

  def allow_staff_manage_skills
    can :manage, Course::Assessment::Skill, course_staff_hash
  end

  def allow_staff_manage_skill_branches
    can :manage, Course::Assessment::SkillBranch, course_staff_hash
  end
end
