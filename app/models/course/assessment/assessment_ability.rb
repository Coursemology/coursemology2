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

  def course_user_hash(*roles)
    { course: { course_users: { user_id: user.id,
                                workflow_state: 'approved',
                                role: roles.map do |role|
                                  [CourseUser.roles[role], role.to_s]
                                end.flatten! } } }
  end

  def all_course_users_hash
    course_user_hash(*CourseUser.roles.keys)
  end

  def staff_hash
    course_user_hash(*CourseUser::STAFF_ROLES.to_a)
  end

  def allow_students_show_assessments
    can :show, Course::Assessment, tab: { category: all_course_users_hash }
  end

  def allow_students_attempt_assessment
    can :attempt, Course::Assessment, tab: { category: all_course_users_hash }
    can [:create, :update], Course::Assessment::Submission, course_user: { user_id: user.id }
  end

  def allow_staff_manage_assessments
    can :manage, Course::Assessment, tab: { category: staff_hash }
  end
end
