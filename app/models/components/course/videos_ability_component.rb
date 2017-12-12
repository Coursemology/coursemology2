# frozen_string_literal: true
module Course::VideosAbilityComponent
  include AbilityHost::Component

  def define_permissions
    if user
      define_student_video_permissions
      define_staff_video_permissions
    end

    super
  end

  private

  def define_student_video_permissions
    allow_student_show_video
    allow_student_attempt_video
    allow_student_create_video_submission
    allow_student_update_own_video_submission
    allow_student_show_video_topics
    allow_student_create_video_topics
    allow_student_update_own_video_session
  end

  def define_staff_video_permissions
    allow_staff_manage_video
    allow_staff_read_and_update_video_submission
  end

  def video_all_course_users_hash
    { lesson_plan_item: course_all_course_users_hash }
  end

  def video_all_course_staff_hash
    { lesson_plan_item: course_staff_hash }
  end

  def video_published_all_course_users_hash
    { lesson_plan_item: { published: true } }.deep_merge(video_all_course_users_hash)
  end

  def video_submission_own_course_user_hash
    { experience_points_record: { course_user: { user_id: user.id } } }
  end

  def allow_student_show_video
    can :read, Course::Video, video_published_all_course_users_hash
  end

  def allow_student_attempt_video
    can :attempt, Course::Video do |video|
      video.published? && video.self_directed_started?
    end
  end

  def allow_student_create_video_submission
    can :create, Course::Video::Submission, video_submission_own_course_user_hash
  end

  def allow_student_update_own_video_submission
    can :update, Course::Video::Submission, video_submission_own_course_user_hash
  end

  def allow_student_update_own_video_session
    can :update, Course::Video::Session, submission: video_submission_own_course_user_hash
  end

  def allow_staff_manage_video
    can :manage, Course::Video, video_all_course_staff_hash
  end

  def allow_staff_read_and_update_video_submission
    can [:read, :update], Course::Video::Submission, video: video_all_course_staff_hash
  end

  def allow_student_show_video_topics
    can :read, Course::Video::Topic, video: video_all_course_users_hash
  end

  def allow_student_create_video_topics
    can :create, Course::Video::Topic, video: video_all_course_users_hash
  end
end
