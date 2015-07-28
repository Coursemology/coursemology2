module Course::Assessment::AssessmentAbility
  def define_permissions
    if user
      allow_students_show_assessments
      allow_students_attempt_assessment
      allow_staff_manage_assessments
    end

    super
  end

  private

  def allow_students_show_assessments
    can :read, Course::Assessment, tab: { category: course_all_course_users_hash }
  end

  def allow_students_attempt_assessment
    can :attempt, Course::Assessment, tab: { category: course_all_course_users_hash }
    can [:create, :update], Course::Assessment::Submission, course_user: { user_id: user.id }
  end

  def allow_staff_manage_assessments
    can :manage, Course::Assessment, tab: { category: course_staff_hash }
  end
end
