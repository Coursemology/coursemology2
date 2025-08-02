# frozen_string_literal: true
json.id record.id
point_updater = @updater_preload_service.course_user_for(record.updater)
updater_user = point_updater || record.updater
json.updater do
  json.id updater_user.id
  json.name updater_user.name
  json.userUrl url_to_user_or_course_user(course, updater_user)
end

json.student do
  json.id record.course_user.id
  json.name record.course_user.name
  json.userUrl course_user_experience_points_records_path(current_course, record.course_user.id)
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
      json.maxExp assessment.base_exp + assessment.time_bonus_exp
      json.text assessment.title
      json.link edit_course_assessment_submission_path(course, assessment, submission)
    when Course::Survey::Response
      response = specific
      survey = response.survey
      json.maxExp survey.base_exp + survey.time_bonus_exp
      json.text survey.title
      if can?(:read_answers, response)
        json.link course_survey_response_path(course, survey, response)
      else
        json.link course_survey_responses_path(course, survey)
      end
    when Course::ScholaisticSubmission
      submission = specific
      scholaistic_assessment = submission.assessment
      json.maxExp scholaistic_assessment.base_exp
      json.text scholaistic_assessment.title
      if can?(:read, scholaistic_assessment)
        json.link course_scholaistic_assessment_submission_path(course, scholaistic_assessment, submission.upstream_id)
      else
        json.link course_scholaistic_assessment_submissions_path(course, scholaistic_assessment)
      end
    end
  end
end

json.pointsAwarded record.points_awarded
json.updatedAt record.updated_at
json.permissions do
  json.canUpdate can?(:update, record)
  json.canDestroy record.manually_awarded? && can?(:destroy, record)
end
