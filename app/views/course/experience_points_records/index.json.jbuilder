# frozen_string_literal: true

json.rowCount = @experience_points_count

json.rowData @experience_points_records do |experience_points_record|
  updater_course_user = @course_user_preload_service.course_user_for(experience_points_record.updater)
  json.updaterCourseUser do
    json.id updater_course_user.id
    json.name updater_course_user.name
  end

  json.manuallyAwarded experience_points_record.manually_awarded?

  if experience_points_record.manually_awarded?
    json.reason experience_points_record.reason
  else
    actable = experience_points_record.specific.actable
    specific = experience_points_record.specific
    json.type specific.actable_type
    case actable
    when Course::Assessment::Submission
      assessment = specific.assessment
      json.reason assessment.title
    when Course::Survey::Response
      response = specific
      survey = response.survey
      json.reason survey.title
      if can?(:read_answers, response)
        json.link course_survey_response_path(current_course, survey, response)
      else
        json.link course_survey_responses_path(current_course, survey)
      end
    end
  end
  json.pointsAwarded experience_points_record.points_awarded
  json.updatedAt experience_points_record.updated_at
  json.permissions do
    json.canUpdate can?(:update, experience_points_record)
    json.canDestroy experience_points_record.manually_awarded? && can?(:destroy, experience_points_record)
  end
end
