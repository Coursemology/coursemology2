# frozen_string_literal: true

json.rowCount @experience_points_count
json.courseUserName @course_user.name

json.experiencePointRecords @experience_points_records do |experience_points_record|
  json.id experience_points_record.id
  course_user = @course_user_preload_service.course_user_for(experience_points_record.updater)
  updater_user = course_user || experience_points_record.updater
  json.updaterUser do
    json.id updater_user.id
    json.name updater_user.name
    json.isCourseUser course_user.present?
  end

  json.reason do
    json.isManuallyAwarded experience_points_record.manually_awarded?
    if experience_points_record.manually_awarded?
      json.text experience_points_record.reason
    else
      specific = experience_points_record.specific
      json.partial! 'experience_points_specific', specific: specific
    end
  end

  json.pointsAwarded experience_points_record.points_awarded
  json.updatedAt experience_points_record.updated_at
  json.permissions do
    json.canUpdate can?(:update, experience_points_record)
    json.canDestroy experience_points_record.manually_awarded? && can?(:destroy, experience_points_record)
  end
end
