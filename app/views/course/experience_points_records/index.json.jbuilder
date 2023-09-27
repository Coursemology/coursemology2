# frozen_string_literal: true

json.rowCount @experience_points_count
json.experiencePointRecords @experience_points_records do |record|
  json.id record.id
  point_updater = @updater_preload_service.course_user_for(record.updater)
  updater_user = point_updater || record.updater
  json.updater do
    json.id updater_user.id
    json.name updater_user.name
    json.userUrl url_to_user_or_course_user(current_course, updater_user)
  end

  json.reason do
    json.isManuallyAwarded record.manually_awarded?
    if record.manually_awarded?
      json.text record.reason
    else
      specific = record.specific
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

  json.pointsAwarded record.points_awarded
  json.updatedAt record.updated_at
  json.courseUserName record.course_user.user.name
  json.userExperienceUrl course_user_experience_points_records_path(current_course, record.course_user_id)
end