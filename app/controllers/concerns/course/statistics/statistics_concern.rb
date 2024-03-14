# frozen_string_literal: true
module Course::Statistics::StatisticsConcern
  private

  # assessment_hash: hash values mapping assessment_id into array of values (grades, time takens, etc.)
  def average_and_stdev_each_assessment(assessment_hash)
    stats_array = assessment_hash.map do |assessment_id, values|
      average_value = values.sum(0.0) / values.size
      
      sum_of_squared_differences = values.sum(0.0) { |value| (value - average_value) ** 2 }
      stdev_value = Math.sqrt(sum_of_squared_differences / values.size)
    
      [assessment_id, average_value, stdev_value]
    end

    stats_array.to_h do |assessment_id, average_value, stdev_value|
      [assessment_id, [average_value, stdev_value]]
    end
  end
end