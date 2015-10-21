module Course::Assessment::AssessmentAbility
  def define_permissions
    if user
      allow_students_show_assessments
      allow_students_attempt_assessment
      allow_staff_manage_assessments
      allow_staff_grade_submissions
    end

    super
  end

  private

  def assessment_all_course_users_hash
    { tab: { category: course_all_course_users_hash } }
  end

  def assessment_course_staff_hash
    { tab: { category: course_staff_hash } }
  end

  def allow_students_show_assessments
    can :read, Course::Assessment, assessment_all_course_users_hash
  end

  def allow_students_attempt_assessment
    can :attempt, Course::Assessment, assessment_all_course_users_hash
    can :create, Course::Assessment::Submission, course_user: { user_id: user.id }
    can :update, Course::Assessment::Submission, course_user: { user_id: user.id },
                                                 workflow_state: 'attempting'
    can :read, Course::Assessment::Submission, course_user: { user_id: user.id }
  end

  def allow_staff_manage_assessments
    can :manage, Course::Assessment, assessment_course_staff_hash
    can :manage, Course::Assessment::Question::MultipleResponse,
        question: { assessment: assessment_course_staff_hash }
  end

  def allow_staff_grade_submissions
    can :read, Course::Assessment::Submission, assessment: assessment_course_staff_hash
    can :grade, Course::Assessment::Submission, assessment: assessment_course_staff_hash,
        workflow_state: ['submitted', 'graded']
  end
end
