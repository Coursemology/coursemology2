# frozen_string_literal: true
module Course::SurveysAbilityComponent
  include AbilityHost::Component

  def define_permissions
    if user
      define_student_survey_permissions
      define_staff_survey_permissions
    end

    super
  end

  private

  def define_student_survey_permissions
    allow_students_show_published_surveys
    allow_students_show_open_survey_sections
    allow_students_read_own_response
    allow_students_update_own_response
    allow_students_create_response
    allow_students_submit_own_response
    allow_students_modify_own_response_to_active_survey
    allow_students_modify_own_response_to_modifiable_submitted_survey
    allow_students_modify_own_response_to_respondable_expired_survey
  end

  def survey_published_all_course_users_hash
    { lesson_plan_item: course_all_course_users_hash.merge(published: true) }
  end

  def survey_open_all_course_users_hash
    survey_published_all_course_users_hash.deep_merge(lesson_plan_item: already_started_hash)
  end

  def survey_active_all_course_users_hashes
    currently_valid_hashes.map do |currently_valid_hash|
      survey_published_all_course_users_hash.deep_merge(lesson_plan_item: currently_valid_hash)
    end
  end

  def survey_expired_but_respondable
    survey_published_all_course_users_hash.deep_merge(
      lesson_plan_item: { end_at: (Time.min..Time.zone.now) },
      allow_response_after_end: true
    )
  end

  def allow_students_show_published_surveys
    can :read, Course::Survey, survey_published_all_course_users_hash
  end

  def allow_students_show_open_survey_sections
    can :read, Course::Survey::Section, survey: survey_open_all_course_users_hash
  end

  def allow_students_read_own_response
    can [:read, :read_answers], Course::Survey::Response,
        survey: survey_open_all_course_users_hash, creator_id: user.id
  end

  def allow_students_create_response
    survey_active_all_course_users_hashes.each do |ability_hash|
      can :create, Course::Survey::Response, survey: ability_hash
    end
    can :create, Course::Survey::Response, survey: survey_expired_but_respondable
  end

  def allow_students_update_own_response
    can :update, Course::Survey::Response, creator_id: user.id
  end

  def allow_students_submit_own_response
    survey_active_all_course_users_hashes.each do |ability_hash|
      can :submit, Course::Survey::Response,
          creator_id: user.id, submitted_at: nil, survey: ability_hash
    end
    can :submit, Course::Survey::Response, creator_id: user.id, submitted_at: nil,
                                           survey: survey_expired_but_respondable
  end

  # To both modify (i.e. update/save changes) and submit a response, user will go to the same
  # response edit page. When the `edit` controller action is hit, cancancan will check if user
  # can `:edit` or `:update` (they are aliases) it. If the user can modify OR submit a
  # response, the user should be able to `:edit`/`:update` it. Thus, we need a separate
  # `:modify` ability to disambiguate it from the less strict `:edit`/`:update` ability.

  def allow_students_modify_own_response_to_active_survey
    survey_active_all_course_users_hashes.each do |ability_hash|
      can :modify, Course::Survey::Response,
          creator_id: user.id, submitted_at: nil, survey: ability_hash
    end
  end

  def allow_students_modify_own_response_to_modifiable_submitted_survey
    can :modify, Course::Survey::Response,
        creator_id: user.id, submitted_at: (Time.min..Time.max),
        survey: survey_open_all_course_users_hash.deep_merge(allow_modify_after_submit: true)
  end

  def allow_students_modify_own_response_to_respondable_expired_survey
    can :modify, Course::Survey::Response, creator_id: user.id, submitted_at: nil,
                                           survey: survey_expired_but_respondable
  end

  def define_staff_survey_permissions
    allow_staff_read_all_surveys
    allow_staff_read_responses
    allow_staff_test_survey
    allow_teaching_staff_manage_surveys
    allow_teaching_staff_manage_sections
    allow_teaching_staff_manage_questions
    allow_teaching_staff_unsubmit_responses
  end

  def survey_staff_hash
    { survey: { lesson_plan_item: course_staff_hash } }
  end

  def survey_teaching_staff_hash
    { survey: { lesson_plan_item: course_teaching_staff_hash } }
  end

  def allow_staff_read_all_surveys
    can :read, Course::Survey, lesson_plan_item: course_staff_hash
    can :read, Course::Survey::Section, survey_staff_hash
  end

  def allow_staff_read_responses
    can :read, Course::Survey::Response, survey_staff_hash
    can :read_answers, Course::Survey::Response,
        survey_staff_hash.merge(survey: { anonymous: false })
  end

  def allow_staff_test_survey
    can :create, Course::Survey::Response, survey_staff_hash
    can [:read_answers, :modify], Course::Survey::Response,
        survey_staff_hash.merge(creator_id: user.id)
    can :submit, Course::Survey::Response,
        survey_staff_hash.merge(creator_id: user.id, submitted_at: nil)
  end

  def allow_teaching_staff_manage_surveys
    can :manage, Course::Survey, lesson_plan_item: course_teaching_staff_hash
  end

  def allow_teaching_staff_manage_sections
    can :manage, Course::Survey::Section, survey_teaching_staff_hash
  end

  def allow_teaching_staff_manage_questions
    can :manage, Course::Survey::Question, section: survey_teaching_staff_hash
  end

  def allow_teaching_staff_unsubmit_responses
    can :unsubmit, Course::Survey::Response,
        survey_teaching_staff_hash.merge(submitted_at: (Time.min..Time.max))
  end
end
