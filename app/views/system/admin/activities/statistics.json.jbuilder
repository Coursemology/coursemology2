# frozen_string_literal: true
json.granularity @granularity
json.firstYear @first_year
json.buckets @statistics.buckets
json.lastCompleteBucket @statistics.last_complete_bucket
json.overall @statistics.overall
# The same months one year earlier; null outside the monthly view and for the first year.
json.previousOverall @previous_statistics&.overall

json.instances @instances do |instance|
  json.id instance.id
  json.name instance.name
  json.host instance.host
  json.counts @statistics.counts_for(instance.id)
  json.previousCounts @previous_statistics&.counts_for(instance.id)
end
