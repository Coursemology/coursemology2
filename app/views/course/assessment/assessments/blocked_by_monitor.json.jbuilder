# frozen_string_literal: true
json.partial! 'assessment_list_data', assessment: @assessment, category: @category, tab: @tab, course: current_course

json.blocked true
