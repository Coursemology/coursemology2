# frozen_string_literal: true
module Course::VideosAbilityComponent
  include AbilityHost::Component

  def define_permissions
    if user
      allow_student_show_video
      allow_student_attempt_video
      allow_staff_manage_video
    end

    super
  end

  private

  def video_all_course_users_hash
    { lesson_plan_item: course_all_course_users_hash }
  end

  def video_all_course_staff_hash
    { lesson_plan_item: course_staff_hash }
  end

  def video_published_all_course_users_hash
    { lesson_plan_item: { published: true } }.deep_merge(video_all_course_users_hash)
  end

  def allow_student_show_video
    can :read, Course::Video, video_published_all_course_users_hash
  end

  def allow_student_attempt_video
    can :attempt, Course::Video do |video|
      video.started? && video.published?
    end
  end

  def allow_staff_manage_video
    can :manage, Course::Video, video_all_course_staff_hash
  end
end
