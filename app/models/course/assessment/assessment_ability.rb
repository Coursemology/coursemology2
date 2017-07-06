# frozen_string_literal: true
module Course::Assessment::AssessmentAbility
  def define_permissions
    if user
      define_student_assessment_permissions
      define_staff_assessment_permissions
    end

    super
  end

  def define_student_assessment_permissions
    allow_students_show_assessments
    allow_students_attempt_assessment
    allow_students_create_assessment_submission
    allow_students_update_own_assessment_submission
    allow_students_manage_annotations_for_own_assessment_submissions
    allow_students_read_own_assessment_answers
    allow_students_read_submission_question
    allow_student_to_destroy_own_attachments_text_response_question
  end

  def define_staff_assessment_permissions
    allow_managers_manage_tab_and_categories
    allow_staff_manage_assessments
    allow_manager_publish_assessment_submission_grades
    allow_staff_grade_assessment_submissions
    allow_staff_manage_assessment_annotations
    allow_staff_read_assessment_answers
    allow_staff_read_assessment_tests
    allow_staff_read_submission_questions
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

  def assessment_submission_attempting_hash(user)
    { workflow_state: 'attempting' }.tap do |result|
      result.reverse_merge!(experience_points_record: { course_user: { user_id: user.id } }) if user
    end
  end

  def allow_students_show_assessments
    can :read_material, Course::Assessment::Category, course_all_course_users_hash
    can :read_material, Course::Assessment::Tab, category: course_all_course_users_hash
    can :read, Course::Assessment, assessment_published_all_course_users_hash
  end

  def allow_students_attempt_assessment
    can [:attempt, :read_material], Course::Assessment do |assessment|
      assessment.published? && assessment.self_directed_started? &&
        assessment.conditions_satisfied_by?(
          user.course_users.find_by(course: assessment.course)
        )
    end
  end

  def allow_students_create_assessment_submission
    can :create, Course::Assessment::Submission,
        experience_points_record: { course_user: { user_id: user.id } }
    can :update, Course::Assessment::Submission, assessment_submission_attempting_hash(user)
    can [:read, :reload_answer], Course::Assessment::Submission,
        experience_points_record: { course_user: { user_id: user.id } }
  end

  def allow_students_update_own_assessment_submission
    can :update, Course::Assessment::Answer, submission: assessment_submission_attempting_hash(user)
  end

  def allow_staff_manage_assessments
    can :manage, Course::Assessment, assessment_course_staff_hash
    can :manage, Course::Assessment::Question::MultipleResponse,
        question: { assessment: assessment_course_staff_hash }
    can :manage, Course::Assessment::Question::TextResponse,
        question: { assessment: assessment_course_staff_hash }
    can :manage, Course::Assessment::Question::Programming,
        question: { assessment: assessment_course_staff_hash }
    can :manage, Course::Assessment::Question::Scribing,
        question: { assessment: assessment_course_staff_hash }
  end

  # Only managers are allowed to publish assessment submission grades
  # Teaching assistants have all assessment abilities except :publish_grades
  def allow_manager_publish_assessment_submission_grades
    cannot :publish_grades, Course::Assessment, assessment_course_staff_hash
    can :publish_grades, Course::Assessment, course_managers_hash
  end

  def allow_managers_manage_tab_and_categories
    can :manage, Course::Assessment::Tab, category: course_managers_hash
    can :manage, Course::Assessment::Category, course_managers_hash
  end

  def allow_staff_grade_assessment_submissions
    can [:read, :update, :reload_answer, :grade],
        Course::Assessment::Submission, assessment: assessment_course_staff_hash
    can :grade, Course::Assessment::Answer, submission: { assessment: assessment_course_staff_hash }
  end

  def allow_staff_read_assessment_tests
    can :read_tests, Course::Assessment::Submission, assessment: assessment_course_staff_hash
  end

  def allow_students_manage_annotations_for_own_assessment_submissions
    can :manage, Course::Assessment::Answer::ProgrammingFileAnnotation,
        file: { answer: { submission: { creator_id: user.id } } }
  end

  def allow_staff_manage_assessment_annotations
    can :manage, Course::Assessment::Answer::ProgrammingFileAnnotation,
        discussion_topic: course_staff_hash
  end

  def allow_students_read_own_assessment_answers
    can :read, Course::Assessment::Answer, submission: { creator_id: user.id }
  end

  def allow_staff_read_assessment_answers
    can :read, Course::Assessment::Answer, discussion_topic: course_staff_hash
  end

  def allow_students_read_submission_question
    can :read, Course::Assessment::SubmissionQuestion, submission: { creator_id: user.id }
  end

  def allow_staff_read_submission_questions
    can :read, Course::Assessment::SubmissionQuestion, discussion_topic: course_staff_hash
  end

  # Prevent everyone from destroying their own attachment, unless they are attempting the question.
  def allow_student_to_destroy_own_attachments_text_response_question
    cannot :destroy_attachment, Course::Assessment::Answer::TextResponse
    can :destroy_attachment, Course::Assessment::Answer::TextResponse,
        submission: assessment_submission_attempting_hash(user)
  end
end
