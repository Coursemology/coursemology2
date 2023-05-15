# frozen_string_literal: true
module Course::VideosAbilityComponent
  include AbilityHost::Component

  def define_permissions
    if course_user
      define_all_video_permissions
      define_staff_video_permissions if course_user.staff?
      define_teaching_staff_video_permissions if course_user.teaching_staff?
      define_managers_video_permissions if course_user.manager_or_owner?
    end

    super
  end

  private

  def define_all_video_permissions
    allow_show_video
    allow_attempt_video
    allow_create_and_read_video_submission
    allow_update_own_video_submission
    allow_show_video_topics
    allow_create_video_topics
    allow_create_and_update_own_video_session
  end

  def lesson_plan_course_hash
    { lesson_plan_item: { course_id: course.id } }
  end

  def video_course_hash
    { video: lesson_plan_course_hash }
  end

  def video_published_course_hash
    { lesson_plan_item: { published: true, course_id: course.id } }
  end

  def video_submission_own_course_user_hash
    { experience_points_record: { course_user: { user_id: user.id } } }
  end

  def allow_show_video
    can :read, Course::Video, video_published_course_hash if course_user.student?
  end

  def allow_attempt_video
    can :attempt, Course::Video do |video|
      course_user = user.course_users.find_by(course: video.course)
      video.published? && video.self_directed_started?(course_user)
    end
  end

  def allow_create_and_read_video_submission
    can :create, Course::Video::Submission, video_submission_own_course_user_hash
    can :read, Course::Video::Submission, video_submission_own_course_user_hash if course_user.student?
  end

  def allow_update_own_video_submission
    can :update, Course::Video::Submission, video_submission_own_course_user_hash
  end

  def allow_create_and_update_own_video_session
    can :create, Course::Video::Session, submission: video_submission_own_course_user_hash
    can :update, Course::Video::Session, submission: video_submission_own_course_user_hash
  end

  def allow_show_video_topics
    can :read, Course::Video::Topic, video_course_hash
  end

  def allow_create_video_topics
    can :create, Course::Video::Topic, video_course_hash
  end

  def define_staff_video_permissions
    allow_staff_read_analyze_and_attempt_all_video
    allow_staff_read_and_analyze_all_video_submission
  end

  def allow_staff_read_analyze_and_attempt_all_video
    can :read, Course::Video, lesson_plan_course_hash
    can :analyze, Course::Video, lesson_plan_course_hash
    can :attempt, Course::Video, lesson_plan_course_hash
  end

  def allow_staff_read_and_analyze_all_video_submission
    can :read, Course::Video::Submission, video_course_hash
    can :analyze, Course::Video::Submission, video_course_hash
  end

  def define_teaching_staff_video_permissions
    allow_teaching_staff_manage_video
    allow_teaching_staff_update_video_submission
  end

  def allow_teaching_staff_manage_video
    can :manage, Course::Video, lesson_plan_course_hash
  end

  def allow_teaching_staff_update_video_submission
    can :update, Course::Video::Submission, video_course_hash
  end

  def define_managers_video_permissions
    allow_course_managers_manage_video_tab
  end

  def allow_course_managers_manage_video_tab
    can :manage, Course::Video::Tab
  end
end
