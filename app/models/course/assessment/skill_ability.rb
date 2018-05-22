# frozen_string_literal: true
module Course::Assessment::SkillAbility
  def define_permissions
    if user
      allow_staff_read_skills_and_skill_branches
      allow_teaching_staff_manage_skills_and_skill_branches
    end

    super
  end

  private

  def allow_staff_read_skills_and_skill_branches
    can :read, Course::Assessment::Skill, course_staff_hash
    can :read, Course::Assessment::SkillBranch, course_staff_hash
  end

  def allow_teaching_staff_manage_skills_and_skill_branches
    can :manage, Course::Assessment::Skill, course_teaching_staff_hash
    can :manage, Course::Assessment::SkillBranch, course_teaching_staff_hash
  end
end
