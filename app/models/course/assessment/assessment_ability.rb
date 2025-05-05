# frozen_string_literal: true
module Course::Assessment::AssessmentAbility
  include Course::Assessment::SubmissionQuestionAbility
  include Course::Assessment::Answer::ProgrammingAbility

  def define_permissions
    if course_user
      define_all_assessment_permissions
      define_student_assessment_permissions if course_user.student?
      define_staff_assessment_permissions if course_user.staff?
      define_teaching_staff_assessment_permissions if course_user.teaching_staff?
      define_manager_assessment_permissions if course_user.manager_or_owner?
    end

    super
  end

  private

  def assessment_course_hash
    { tab: { category: { course_id: course.id } } }
  end

  def assessment_submission_attempting_hash(user)
    { workflow_state: 'attempting' }.tap do |result|
      result.reverse_merge!(experience_points_record: { course_user: { user_id: user.id } }) if user
    end
  end

  def define_all_assessment_permissions
    allow_read_assessments
    allow_access_assessment
    allow_attempt_assessment
    allow_read_material
    allow_create_assessment_submission
    allow_update_own_assessment_answer
    allow_to_destroy_own_attachments_text_response_question
  end

  def allow_read_assessments
    can :read_material, Course::Assessment::Category, course_id: course.id
    can :read_material, Course::Assessment::Tab, category: { course_id: course.id }
    can :authenticate, Course::Assessment, lesson_plan_item: { published: true, course_id: course.id }
    can :unblock_monitor, Course::Assessment, lesson_plan_item: { published: true, course_id: course.id }
    can :requirements, Course::Assessment, lesson_plan_item: { published: true, course_id: course.id }
  end

  # 'access' refers to the ability to access password-protected assessments.
  def allow_access_assessment
    can :access, Course::Assessment do |assessment|
      if assessment.is_koditsu_enabled
        true # for Koditsu assessment, the password will be inputted by students in Koditsu platform, not in CM
      elsif assessment.view_password_protected?
        Course::Assessment::AuthenticationService.new(assessment, @session_id).authenticated? ||
          assessment.submissions.by_user(user).count > 0
      else
        true
      end
    end
  end

  def allow_attempt_assessment
    can :attempt, Course::Assessment do |assessment|
      assessment.published? && assessment.self_directed_started?(course_user) &&
        assessment.conditions_satisfied_by?(course_user)
    end
  end

  def allow_read_material
    can :read_material, Course::Assessment do |assessment|
      can?(:access, assessment) && can?(:attempt, assessment)
    end
  end

  def allow_create_assessment_submission
    can [:create, :fetch_live_feedback_chat], Course::Assessment::Submission,
        experience_points_record: { course_user: { user_id: user.id } }
    can [:update, :generate_live_feedback, :save_live_feedback,
         :create_live_feedback_chat, :fetch_live_feedback_status],
        Course::Assessment::Submission, assessment_submission_attempting_hash(user)
  end

  def allow_update_own_assessment_answer
    can [:update, :submit_answer], Course::Assessment::Answer, submission: assessment_submission_attempting_hash(user)
  end

  # Prevent everyone from destroying their own attachment, unless they are attempting the question.
  def allow_to_destroy_own_attachments_text_response_question
    cannot :destroy_attachment, Course::Assessment::Answer::TextResponse
    can :destroy_attachment, Course::Assessment::Answer::TextResponse,
        submission: assessment_submission_attempting_hash(user)
  end

  def define_student_assessment_permissions
    allow_read_published_assessments
    allow_read_own_assessment_submission
    allow_read_own_assessment_answers
    allow_read_own_submission_question
    allow_manage_annotations_for_own_assessment_submissions
  end

  def allow_read_published_assessments
    can :read, Course::Assessment, lesson_plan_item: { published: true, course_id: course.id }
  end

  def allow_read_own_assessment_submission
    can [:read, :reload_answer], Course::Assessment::Submission,
        experience_points_record: { course_user: { user_id: user.id } }
  end

  def allow_read_own_assessment_answers
    can :read, Course::Assessment::Answer, submission: { creator_id: user.id }
  end

  def allow_read_own_submission_question
    can :read, Course::Assessment::SubmissionQuestion, submission: { creator_id: user.id }
  end

  def allow_manage_annotations_for_own_assessment_submissions
    can :manage, Course::Assessment::Answer::ProgrammingFileAnnotation,
        file: { answer: { submission: { creator_id: user.id } } }
  end

  def define_staff_assessment_permissions
    allow_staff_read_observe_access_and_attempt_assessment
    allow_staff_read_assessment_submissions
    allow_staff_read_assessment_tests
    allow_staff_read_submission_questions
    allow_staff_delete_own_assessment_submission
    allow_staff_update_category_grades
    allow_staff_update_category_explanations
  end

  def allow_staff_read_observe_access_and_attempt_assessment
    can :read, Course::Assessment, assessment_course_hash
    can :observe, Course::Assessment, assessment_course_hash
    can :attempt, Course::Assessment, assessment_course_hash
    can :access, Course::Assessment, assessment_course_hash
  end

  def allow_staff_read_assessment_submissions
    can :view_all_submissions, Course::Assessment, assessment_course_hash
    can :read, Course::Assessment::Submission, assessment: assessment_course_hash
  end

  def allow_staff_read_assessment_tests
    can :read_tests, Course::Assessment::Submission, assessment: assessment_course_hash
  end

  def allow_staff_update_category_grades
    can :update_category_grades, Course::Assessment::Submission, assessment: assessment_course_hash
  end

  def allow_staff_update_category_explanations
    can :update_category_explanations, Course::Assessment::Submission, assessment: assessment_course_hash
  end

  def allow_staff_read_submission_questions
    can :read, Course::Assessment::SubmissionQuestion, discussion_topic: { course_id: course.id }
  end

  def allow_staff_delete_own_assessment_submission
    can :delete_submission, Course::Assessment::Submission, creator_id: user.id
  end

  def define_teaching_staff_assessment_permissions
    allow_teaching_staff_read_tab_and_categories
    allow_teaching_staff_manage_assessments
    allow_teaching_staff_grade_assessment_submissions
    allow_teaching_staff_manage_assessment_annotations
    allow_teaching_staff_interact_with_live_feedback
    disallow_teaching_staff_publish_assessment_submission_grades
    disallow_teaching_staff_force_submit_assessment_submissions
    disallow_teaching_staff_delete_assessment_submissions
  end

  def allow_teaching_staff_read_tab_and_categories
    can :read, Course::Assessment::Tab, category: { course_id: course.id }
    can :read, Course::Assessment::Category, course_id: course.id
  end

  def allow_teaching_staff_manage_assessments
    can :manage, Course::Assessment, assessment_course_hash
    allow_manage_questions
  end

  def allow_manage_questions
    question_assessments_current_course =
      { question_assessments: { assessment: assessment_course_hash } }

    [
      Course::Assessment::Question::ForumPostResponse,
      Course::Assessment::Question::MultipleResponse,
      Course::Assessment::Question::TextResponse,
      Course::Assessment::Question::Programming,
      Course::Assessment::Question::RubricBasedResponse,
      Course::Assessment::Question::Scribing,
      Course::Assessment::Question::VoiceResponse
    ].each do |question_class|
      can :create, question_class
      can :manage, question_class, question: question_assessments_current_course
    end
    can :duplicate, Course::Assessment::Question, question_assessments_current_course
    can :import_result, Course::Assessment::Question::Programming
    can :codaveri_languages, Course::Assessment::Question::Programming
    can :generate, Course::Assessment::Question::Programming
  end

  def allow_teaching_staff_grade_assessment_submissions
    can [:update, :reload_answer, :grade, :reevaluate_answer, :generate_feedback],
        Course::Assessment::Submission, assessment: assessment_course_hash
    can :grade, Course::Assessment::Answer,
        submission: { assessment: assessment_course_hash }
  end

  def allow_teaching_staff_interact_with_live_feedback
    can [:generate_live_feedback, :save_live_feedback, :create_live_feedback_chat,
         :fetch_live_feedback_status, :fetch_live_feedback_chat],
        Course::Assessment::Submission, assessment: assessment_course_hash
  end

  def allow_teaching_staff_manage_assessment_annotations
    can :manage, Course::Assessment::Answer::ProgrammingFileAnnotation,
        discussion_topic: { course_id: course.id }
  end

  # Teaching assistants have all assessment abilities except :publish_grades
  def disallow_teaching_staff_publish_assessment_submission_grades
    cannot :publish_grades, Course::Assessment
  end

  # Teaching assistants have all assessment abilities except :force_submit_submission
  def disallow_teaching_staff_force_submit_assessment_submissions
    cannot :force_submit_assessment_submission, Course::Assessment
  end

  # Teaching assistants can only delete his/her own submission
  def disallow_teaching_staff_delete_assessment_submissions
    cannot :delete_all_submissions, Course::Assessment
  end

  def define_manager_assessment_permissions
    allow_manager_manage_tab_and_categories
    allow_manager_publish_assessment_submission_grades
    allow_manager_invite_users_to_koditsu
    allow_manager_force_submit_assessment_submissions
    allow_manager_fetch_submissions_from_koditsu
    allow_manager_delete_assessment_submissions
    allow_manager_update_assessment_answer
  end

  def allow_manager_manage_tab_and_categories
    can :manage, Course::Assessment::Tab, category: { course_id: course.id }
    can :manage, Course::Assessment::Category, course_id: course.id
  end

  # Only managers are allowed to publish assessment submission grades
  def allow_manager_publish_assessment_submission_grades
    can :publish_grades, Course::Assessment, assessment_course_hash
  end

  def allow_manager_invite_users_to_koditsu
    can :invite_to_koditsu, Course::Assessment, assessment_course_hash
  end

  # Only managers are allowed to force submit assessment submissions
  def allow_manager_force_submit_assessment_submissions
    can :force_submit_assessment_submission, Course::Assessment, assessment_course_hash
  end

  def allow_manager_fetch_submissions_from_koditsu
    can :fetch_submissions_from_koditsu, Course::Assessment, assessment_course_hash
  end

  # Only managers and above are allowed to delete assessment submissions
  def allow_manager_delete_assessment_submissions
    can :delete_all_submissions, Course::Assessment, assessment_course_hash
    can :delete_submission, Course::Assessment::Submission, assessment: assessment_course_hash
  end

  def allow_manager_update_assessment_answer
    can [:update, :submit_answer], Course::Assessment::Answer, submission: { assessment: assessment_course_hash }
  end
end
