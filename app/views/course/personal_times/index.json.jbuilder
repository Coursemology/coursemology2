# frozen_string_literal: true

json.personalTimes @items.each do |item|
  json.partial! 'personal_time_data', item: item
end
