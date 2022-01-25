# frozen_string_literal: true
module Course::SurveysAbilityComponent
  include AbilityHost::Component

  def define_permissions
    if course_user && !user.administrator?
      define_all_survey_permissions
      define_staff_survey_permissions if course_user.staff?
      define_teaching_staff_survey_permissions if course_user.teaching_staff?
    end

    super
  end

  private

  def survey_course_hash
    { survey: { lesson_plan_item: { course_id: course.id } } }
  end

  def define_all_survey_permissions
    if course_user.student?
      allow_read_published_surveys
      allow_read_open_survey_sections
      allow_read_own_response
    end
    allow_update_own_response
    allow_create_response
    allow_submit_own_response
    allow_modify_own_response_to_active_survey
    allow_modify_own_response_to_modifiable_submitted_survey
    disallow_modify_own_response_to_modifiable_expired_submitted_survey
    allow_modify_own_response_to_respondable_expired_survey
  end

  def survey_published_all_course_users_hash
    { lesson_plan_item: { course_id: course.id, published: true } }
  end

  def survey_open_all_course_users_hash
    # TODO(#3092): Check timings for individual users
    survey_published_all_course_users_hash.deep_merge(
      lesson_plan_item: { default_reference_time: already_started_hash }
    )
  end

  def survey_active_all_course_users_hashes
    currently_valid_hashes.map do |currently_valid_hash|
      survey_published_all_course_users_hash.deep_merge(lesson_plan_item: currently_valid_hash)
    end
  end

  def survey_expired_but_respondable
    # TODO(#3092): Check timings for individual users
    survey_published_all_course_users_hash.deep_merge(
      lesson_plan_item: { default_reference_time: { end_at: (Time.min..Time.zone.now) } },
      allow_response_after_end: true
    )
  end

  def survey_expired_and_not_respondable
    survey_published_all_course_users_hash.deep_merge(
      lesson_plan_item: { default_reference_time: { end_at: (Time.min..Time.zone.now) } },
      allow_response_after_end: false, allow_modify_after_submit: true
    )
  end

  def allow_read_published_surveys
    can :read, Course::Survey, survey_published_all_course_users_hash
  end

  def allow_read_open_survey_sections
    can :read, Course::Survey::Section, survey: survey_open_all_course_users_hash
  end

  def allow_read_own_response
    can [:read, :read_answers], Course::Survey::Response,
        survey: survey_open_all_course_users_hash, creator_id: user.id
  end

  def allow_create_response
    survey_active_all_course_users_hashes.each do |ability_hash|
      can :create, Course::Survey::Response, survey: ability_hash
    end
    can :create, Course::Survey::Response, survey: survey_expired_but_respondable
  end

  def allow_update_own_response
    can :update, Course::Survey::Response, creator_id: user.id
  end

  def allow_submit_own_response
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

  def allow_modify_own_response_to_active_survey
    survey_active_all_course_users_hashes.each do |ability_hash|
      can :modify, Course::Survey::Response,
          creator_id: user.id, submitted_at: nil, survey: ability_hash
    end
  end

  def allow_modify_own_response_to_modifiable_submitted_survey
    can :modify, Course::Survey::Response,
        creator_id: user.id, submitted_at: (Time.min..Time.max),
        survey: survey_open_all_course_users_hash.deep_merge(allow_modify_after_submit: true)
  end

  def disallow_modify_own_response_to_modifiable_expired_submitted_survey
    cannot :modify, Course::Survey::Response, survey: survey_expired_and_not_respondable
  end

  def allow_modify_own_response_to_respondable_expired_survey
    can :modify, Course::Survey::Response, creator_id: user.id, submitted_at: nil,
                                           survey: survey_expired_but_respondable
  end

  def define_staff_survey_permissions
    allow_staff_read_all_surveys
    allow_staff_read_responses
    allow_staff_test_survey
  end

  def allow_staff_read_all_surveys
    can :read, Course::Survey, lesson_plan_item: { course_id: course.id }
    can :read, Course::Survey::Section, survey_course_hash
  end

  def allow_staff_read_responses
    can :read, Course::Survey::Response, survey_course_hash
    can :read_answers, Course::Survey::Response,
        survey_course_hash.merge(survey: { anonymous: false })
  end

  def allow_staff_test_survey
    can :create, Course::Survey::Response, survey_course_hash
    can [:read_answers, :modify], Course::Survey::Response,
        survey_course_hash.merge(creator_id: user.id)
    can :submit, Course::Survey::Response,
        survey_course_hash.merge(creator_id: user.id, submitted_at: nil)
  end

  def define_teaching_staff_survey_permissions
    allow_teaching_staff_manage_surveys
    allow_teaching_staff_manage_sections
    allow_teaching_staff_manage_questions
    allow_teaching_staff_unsubmit_responses
  end

  def allow_teaching_staff_manage_surveys
    can :manage, Course::Survey, lesson_plan_item: { course_id: course.id }
  end

  def allow_teaching_staff_manage_sections
    can :manage, Course::Survey::Section, survey_course_hash
  end

  def allow_teaching_staff_manage_questions
    can :manage, Course::Survey::Question, section: survey_course_hash
  end

  def allow_teaching_staff_unsubmit_responses
    can :unsubmit, Course::Survey::Response,
        survey_course_hash.merge(submitted_at: (Time.min..Time.max))
  end
end
