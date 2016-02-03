# frozen_string_literal: true
module Course::Assessment::AssessmentAbility
  def define_permissions
    if user
      allow_students_show_assessments
      allow_students_attempt_assessment
      allow_staff_manage_assessments
      allow_staff_grade_submissions
      allow_auto_grader_programming_evaluations
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
    currently_valid_hashes.each do |properties|
      can :attempt, Course::Assessment, assessment_all_course_users_hash.reverse_merge(
        lesson_plan_item: properties
      )
    end
    can :create, Course::Assessment::Submission, course_user: { user_id: user.id }
    can :update, Course::Assessment::Submission, course_user: { user_id: user.id },
                                                 workflow_state: 'attempting'
    can :read, Course::Assessment::Submission, course_user: { user_id: user.id }
  end

  def allow_staff_manage_assessments
    can :manage, Course::Assessment, assessment_course_staff_hash
    can :manage, Course::Assessment::Question::MultipleResponse,
        question: { assessment: assessment_course_staff_hash }
    can :manage, Course::Assessment::Question::TextResponse,
        question: { assessment: assessment_course_staff_hash }
    can :manage, Course::Assessment::Question::Programming,
        question: { assessment: assessment_course_staff_hash }
  end

  def allow_staff_grade_submissions
    can :read, Course::Assessment::Submission, assessment: assessment_course_staff_hash
    can :grade, Course::Assessment::Submission, assessment: assessment_course_staff_hash,
                                                workflow_state: ['submitted', 'graded']
  end

  def allow_auto_grader_programming_evaluations
    if user.auto_grader?
      allow_system_auto_grader_programming_evaluations
    else
      allow_instance_auto_grader_programming_evaluations
      allow_course_auto_grader_programming_evaluations
    end
  end

  def allow_system_auto_grader_programming_evaluations
    can :read, Course::Assessment::ProgrammingEvaluation
    can :update_result, Course::Assessment::ProgrammingEvaluation, evaluator_id: user.id
  end

  def allow_instance_auto_grader_programming_evaluations
    instance_auto_grader_hash = {
      instance: {
        instance_users: { user_id: user.id, role: InstanceUser.roles[:auto_grader] }
      }
    }
    can :read, Course::Assessment::ProgrammingEvaluation, course: instance_auto_grader_hash
    can :update_result, Course::Assessment::ProgrammingEvaluation, evaluator_id: user.id
  end

  def allow_course_auto_grader_programming_evaluations
    can :read, Course::Assessment::ProgrammingEvaluation,
        course_course_user_hash(*CourseUser::AUTO_GRADER_ROLES.to_a)
    can :update_result, Course::Assessment::ProgrammingEvaluation, evaluator_id: user.id
  end
end
