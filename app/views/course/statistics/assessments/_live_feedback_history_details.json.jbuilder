# frozen_string_literal: true
json.files @live_feedback_details_hash[live_feedback_id].each do |live_feedback_details|
  json.id live_feedback_details[:code][:id]
  json.filename live_feedback_details[:code][:filename]
  json.content live_feedback_details[:code][:content]
  json.language @question.specific.language[:name]
  json.comments live_feedback_details[:comments].map do |comment|
    json.lineNumber comment[:line_number]
    json.comment comment[:comment]
  end
end
