# frozen_string_literal: true
# Everything a breadcrumb renders, and nothing else. The same partial `authenticate` and
# `blocked_by_monitor` open with, so a crumb request reads the same four fields whichever of the three
# `show` renders.
json.partial! 'assessment_list_data', assessment: @assessment, category: @category, tab: @tab, course: current_course
