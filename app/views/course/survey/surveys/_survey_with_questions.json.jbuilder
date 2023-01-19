# frozen_string_literal: true
json.partial! 'course/survey/surveys/survey', survey: survey, survey_time: survey_time
json.sections @sections, partial: 'course/survey/sections/section', as: :section
