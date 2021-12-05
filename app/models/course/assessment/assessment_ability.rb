# frozen_string_literal: true
module Course::Assessment::AssessmentAbility
  include Course::Assessment::SubmissionQuestionAbility
  include Course::Assessment::Answer::ProgrammingAbility

  def define_permissions
    if user
      define_student_assessment_permissions
      define_staff_assessment_permissions
    end

    super
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

  def assessment_course_teaching_staff_hash
    { tab: { category: course_teaching_staff_hash } }
  end

  def assessment_submission_attempting_hash(user)
    { workflow_state: 'attempting' }.tap do |result|
      result.reverse_merge!(experience_points_record: { course_user: { user_id: user.id } }) if user
    end
  end

  def define_student_assessment_permissions
    allow_students_show_assessments
    allow_students_access_assessment
    allow_students_attempt_assessment
    allow_students_read_material
    allow_students_create_assessment_submission
    allow_students_update_own_assessment_submission
    allow_students_manage_annotations_for_own_assessment_submissions
    allow_students_read_own_assessment_answers
    allow_students_read_submission_question
    allow_student_to_destroy_own_attachments_text_response_question
  end

  def allow_students_show_assessments
    can :read_material, Course::Assessment::Category, course_all_course_users_hash
    can :read_material, Course::Assessment::Tab, category: course_all_course_users_hash
    can :read, Course::Assessment, assessment_published_all_course_users_hash
    can :authenticate, Course::Assessment, assessment_published_all_course_users_hash
  end

  # 'access' refers to the ability to access password-protected assessments.
  def allow_students_access_assessment
    can :access, Course::Assessment do |assessment|
      if assessment.view_password_protected?
        Course::Assessment::AuthenticationService.new(assessment, session).authenticated? ||
          assessment.submissions.by_user(user).count > 0
      else
        true
      end
    end
  end

  def allow_students_attempt_assessment
    can :attempt, Course::Assessment do |assessment|
      course_user = user.course_users.find_by(course: assessment.course)
      assessment.published? && assessment.self_directed_started?(course_user) &&
        assessment.conditions_satisfied_by?(course_user)
    end
  end

  def allow_students_read_material
    can :read_material, Course::Assessment do |assessment|
      can?(:access, assessment) && can?(:attempt, assessment)
    end
  end

  def allow_students_create_assessment_submission
    can :create, Course::Assessment::Submission,
        experience_points_record: { course_user: { user_id: user.id } }
    can [:update, :submit_answer], Course::Assessment::Submission, assessment_submission_attempting_hash(user)
    can [:read, :reload_answer], Course::Assessment::Submission,
        experience_points_record: { course_user: { user_id: user.id } }
  end

  def allow_students_update_own_assessment_submission
    can :update, Course::Assessment::Answer, submission: assessment_submission_attempting_hash(user)
  end

  def allow_students_manage_annotations_for_own_assessment_submissions
    can :manage, Course::Assessment::Answer::ProgrammingFileAnnotation,
        file: { answer: { submission: { creator_id: user.id } } }
  end

  def allow_students_read_own_assessment_answers
    can :read, Course::Assessment::Answer, submission: { creator_id: user.id }
  end

  def allow_students_read_submission_question
    can :read, Course::Assessment::SubmissionQuestion, submission: { creator_id: user.id }
  end

  # Prevent everyone from destroying their own attachment, unless they are attempting the question.
  def allow_student_to_destroy_own_attachments_text_response_question
    cannot :destroy_attachment, Course::Assessment::Answer::TextResponse
    can :destroy_attachment, Course::Assessment::Answer::TextResponse,
        submission: assessment_submission_attempting_hash(user)
  end

  def define_staff_assessment_permissions
    allow_staff_read_observe_access_and_attempt_assessment
    allow_staff_read_assessment_submissions
    allow_staff_read_assessment_tests
    allow_staff_read_submission_questions
    allow_teaching_staff_manage_assessments
    allow_teaching_staff_grade_assessment_submissions
    allow_teaching_staff_manage_assessment_annotations
    allow_managers_manage_tab_and_categories
    allow_manager_publish_assessment_submission_grades
    allow_manager_force_submit_assessment_submissions
    allow_manager_delete_assessment_submission
  end

  def allow_staff_read_observe_access_and_attempt_assessment
    can :read, Course::Assessment, assessment_course_staff_hash
    can :observe, Course::Assessment, assessment_course_staff_hash
    can :attempt, Course::Assessment, assessment_course_staff_hash
    can :access, Course::Assessment, assessment_course_staff_hash
  end

  def allow_staff_read_assessment_submissions
    can :view_all_submissions, Course::Assessment, assessment_course_staff_hash
    can :read, Course::Assessment::Submission, assessment: assessment_course_staff_hash
  end

  def allow_staff_read_assessment_tests
    can :read_tests, Course::Assessment::Submission, assessment: assessment_course_staff_hash
  end

  def allow_staff_read_submission_questions
    can :read, Course::Assessment::SubmissionQuestion, discussion_topic: course_staff_hash
  end

  def allow_teaching_staff_manage_assessments
    can :manage, Course::Assessment, assessment_course_teaching_staff_hash
    allow_manage_questions if course_user&.teaching_staff?
  end

  def allow_manage_questions
    question_assessments_current_course =
      { question_assessments: { assessment: { tab: { category: { course: course } } } } }

    [
      Course::Assessment::Question::MultipleResponse,
      Course::Assessment::Question::TextResponse,
      Course::Assessment::Question::Programming,
      Course::Assessment::Question::Scribing,
      Course::Assessment::Question::VoiceResponse
    ].each do |question_class|
      can :create, question_class
      can :manage, question_class, question: question_assessments_current_course
    end
    can :duplicate, Course::Assessment::Question, question_assessments_current_course
  end

  def allow_teaching_staff_grade_assessment_submissions
    can [:update, :reload_answer, :grade],
        Course::Assessment::Submission, assessment: assessment_course_teaching_staff_hash
    can :grade, Course::Assessment::Answer,
        submission: { assessment: assessment_course_teaching_staff_hash }
  end

  def allow_teaching_staff_manage_assessment_annotations
    can :manage, Course::Assessment::Answer::ProgrammingFileAnnotation,
        discussion_topic: course_teaching_staff_hash
  end

  def allow_managers_manage_tab_and_categories
    can :manage, Course::Assessment::Tab, category: course_managers_hash
    can :manage, Course::Assessment::Category, course_managers_hash
  end

  # Only managers are allowed to publish assessment submission grades
  # Teaching assistants have all assessment abilities except :publish_grades
  def allow_manager_publish_assessment_submission_grades
    cannot :publish_grades, Course::Assessment, assessment_course_staff_hash
    can :publish_grades, Course::Assessment, course_managers_hash
  end

  # Only managers are allowed to force submit assessment submissions
  # Teaching assistants have all assessment abilities except :force_submit_submission
  def allow_manager_force_submit_assessment_submissions
    cannot :force_submit_assessment_submission, Course::Assessment, assessment_course_staff_hash
    can :force_submit_assessment_submission, Course::Assessment, course_managers_hash
  end

  # Only managers and above are allowed to delete assessment submissions
  # Teaching assistants can only delete his/her own submission
  def allow_manager_delete_assessment_submission
    cannot :delete_all_submissions, Course::Assessment, assessment_course_staff_hash
    can :delete_all_submissions, Course::Assessment, course_managers_hash

    can :delete_submission, Course::Assessment::Submission, assessment: course_managers_hash
    can :delete_submission, Course::Assessment::Submission,
        { assessment: course_teaching_assistants_hash }.reverse_merge(creator: user)
  end
end
