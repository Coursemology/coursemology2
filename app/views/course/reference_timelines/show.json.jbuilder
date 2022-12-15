# frozen_string_literal: true
json.partial! 'reference_timeline', reference_timeline: @reference_timeline, render_times: true
json.default @reference_timeline.default
