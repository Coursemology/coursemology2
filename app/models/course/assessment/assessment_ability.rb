# frozen_string_literal: true
module Course::Assessment::AssessmentAbility
  def define_permissions
    if user
      define_student_permissions
      define_staff_permissions
      define_auto_grader_permissions
    end

    super
  end

  def define_student_permissions
    allow_students_show_assessments
    allow_students_attempt_assessment
    allow_students_create_submission
    allow_students_update_own_submission
    allow_students_manage_annotations_for_own_submissions
    allow_students_read_own_answers
  end

  def define_staff_permissions
    allow_managers_manage_tab_and_categories
    allow_staff_manage_assessments
    allow_staff_grade_submissions
    allow_staff_manage_annotations
    allow_staff_read_answers
    allow_manager_publish_submissions
    allow_staff_read_tests
  end

  def define_auto_grader_permissions
    allow_auto_grader_programming_evaluations
  end

  private

  def assessment_all_course_users_hash
    { tab: { category: course_all_course_users_hash } }
  end

  def assessment_published_all_course_users_hash
    { lesson_plan_item: { published: true } }.reverse_merge(assessment_all_course_users_hash)
  end

  def assessment_course_staff_hash
    { tab: { category: course_staff_hash } }
  end

  def submission_attempting_hash(user)
    { workflow_state: 'attempting' }.tap do |result|
      result.reverse_merge!(experience_points_record: { course_user: { user_id: user.id } }) if user
    end
  end

  def allow_students_show_assessments
    can :read, Course::Assessment, assessment_published_all_course_users_hash
  end

  def allow_students_attempt_assessment
    can :attempt, Course::Assessment do |assessment|
      assessment.started? && assessment.published? && assessment.conditions_satisfied_by?(
        user.course_users.find_by(course: assessment.course)
      )
    end
  end

  def allow_students_create_submission
    can :create, Course::Assessment::Submission,
        experience_points_record: { course_user: { user_id: user.id } }
    can :update, Course::Assessment::Submission, submission_attempting_hash(user)
    can [:read, :reload_answer], Course::Assessment::Submission,
        experience_points_record: { course_user: { user_id: user.id } }
  end

  def allow_students_update_own_submission
    can :update, Course::Assessment::Answer, submission: submission_attempting_hash(user)
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

  def allow_managers_manage_tab_and_categories
    can :manage, Course::Assessment::Tab, category: course_managers_hash
    can :manage, Course::Assessment::Category, course_managers_hash
  end

  def allow_manager_publish_submissions
    can :publish_all, Course::Assessment::Submission,
        assessment: { tab: { category: course_managers_hash } }
  end

  def allow_staff_grade_submissions
    can [:read, :update, :reload_answer, :grade],
        Course::Assessment::Submission, assessment: assessment_course_staff_hash
    can :grade, Course::Assessment::Answer, submission: { assessment: assessment_course_staff_hash }
  end

  def allow_staff_read_tests
    can :read_tests, Course::Assessment::Submission, assessment: assessment_course_staff_hash
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

  def allow_students_manage_annotations_for_own_submissions
    can :manage, Course::Assessment::Answer::ProgrammingFileAnnotation,
        file: { answer: { submission: { creator_id: user.id } } }
  end

  def allow_staff_manage_annotations
    can :manage, Course::Assessment::Answer::ProgrammingFileAnnotation,
        discussion_topic: course_staff_hash
  end

  def allow_students_read_own_answers
    can :read, Course::Assessment::Answer, submission: { creator_id: user.id }
  end

  def allow_staff_read_answers
    can :read, Course::Assessment::Answer, discussion_topic: course_staff_hash
  end
end
