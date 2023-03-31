# frozen_string_literal: true
json.log do
  json.partial! 'info', course: current_course, assessment: @assessment, submission: @submission
  json.partial! 'logs', submission: @submission
end
