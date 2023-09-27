# frozen_string_literal: true

json.rowCount @experience_points_count
json.courseUserName @course_user.name

json.experiencePointRecords @experience_points_records do |experience_points_record|
  json.id experience_points_record.id
  point_updater = @updater_preload_service.course_user_for(experience_points_record.updater)
  updater_user = point_updater || experience_points_record.updater
  json.updater do
    json.id updater_user.id
    json.name updater_user.name
    json.userUrl url_to_user_or_course_user(current_course, updater_user)
  end

  json.reason do
    json.isManuallyAwarded experience_points_record.manually_awarded?
    if experience_points_record.manually_awarded?
      json.text experience_points_record.reason
    else
      specific = experience_points_record.specific
      actable = specific.actable
      case actable
      when Course::Assessment::Submission
        submission = specific
        assessment = submission.assessment
        json.text assessment.title
        json.link edit_course_assessment_submission_path(current_course, assessment, submission)
      when Course::Survey::Response
        response = specific
        survey = response.survey
        json.text survey.title
        if can?(:read_answers, response)
          json.link course_survey_response_path(current_course, survey, response)
        else
          json.link course_survey_responses_path(current_course, survey)
        end
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
