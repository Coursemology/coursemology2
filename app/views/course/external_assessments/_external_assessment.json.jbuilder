# frozen_string_literal: true
json.id(-external_assessment.id)
json.title external_assessment.title
json.tabId external_assessment.synthetic_tab_id
json.maxGrade external_assessment.maximum_grade.to_f
json.external true
json.gradebookExcluded false
