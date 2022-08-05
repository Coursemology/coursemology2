# frozen_string_literal: true
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
