# frozen_string_literal: true
module Course::PlagiarismAbilityComponent
  include AbilityHost::Component

  def define_permissions
    allow_managers_manage_plagiarism if course_user&.manager_or_owner?
    super
  end

  private

  def allow_managers_manage_plagiarism
    can :manage_plagiarism, Course, id: course.id
  end
end
