# frozen_string_literal: true
module Course::SurveysAbilityComponent
  include AbilityHost::Component

  def define_permissions
    if user
      define_staff_survey_permissions
      define_student_survey_permissions
    end

    super
  end

  private

  def surveys_published_all_course_users_hash
    { lesson_plan_item: course_all_course_users_hash.merge(published: true) }
  end

  def surveys_open_published_all_course_users_hash
    surveys_published_all_course_users_hash.deep_merge(lesson_plan_item: already_started_hash)
  end

  def define_staff_survey_permissions
    allow_staff_manage_surveys
    allow_staff_manage_sections
    allow_staff_manage_questions
    allow_staff_manage_responses
  end

  def allow_staff_manage_surveys
    can :manage, Course::Survey, lesson_plan_item: course_staff_hash
  end

  def allow_staff_manage_sections
    can :manage, Course::Survey::Section, survey: { lesson_plan_item: course_staff_hash }
  end

  def allow_staff_manage_questions
    can :manage, Course::Survey::Question,
        section: { survey: { lesson_plan_item: course_staff_hash } }
  end

  def allow_staff_manage_responses
    can :manage, Course::Survey::Response, survey: { lesson_plan_item: course_staff_hash }
  end

  def define_student_survey_permissions
    allow_students_show_published_surveys
    allow_students_show_open_survey_sections
    allow_students_read_update_own_response
    allow_students_create_response
  end

  def allow_students_show_published_surveys
    can :read, Course::Survey, surveys_published_all_course_users_hash
  end

  def allow_students_show_open_survey_sections
    can :read, Course::Survey::Section, survey: surveys_open_published_all_course_users_hash
  end

  def allow_students_read_update_own_response
    can [:read, :update], Course::Survey::Response,
        survey: surveys_open_published_all_course_users_hash, creator_id: user.id
  end

  def allow_students_create_response
    can :create, Course::Survey::Response, survey: surveys_open_published_all_course_users_hash
  end
end
