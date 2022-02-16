# frozen_string_literal: true
module Course::Assessment::SkillAbility
  def define_permissions
    if course_user
      allow_staff_read_skills_and_skill_branches if course_user.staff?
      allow_teaching_staff_manage_skills_and_skill_branches if course_user.teaching_staff?
    end

    super
  end

  private

  def allow_staff_read_skills_and_skill_branches
    can :read, Course::Assessment::Skill, course_id: course.id
    can :read, Course::Assessment::SkillBranch, course_id: course.id
  end

  def allow_teaching_staff_manage_skills_and_skill_branches
    can :manage, Course::Assessment::Skill, course_id: course.id
    can :manage, Course::Assessment::SkillBranch, course_id: course.id
  end
end
