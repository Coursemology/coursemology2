json.partial! 'survey', survey: survey
json.sections @sections, partial: 'course/survey/sections/section', as: :section
