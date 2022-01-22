# frozen_string_literal: true
class OtotPersonalizationStrategy < BasePersonalizationStrategy
  # Applies the appropriate algorithm strategy for the student based on the student's learning rate.
  #
  # The expected precomputed_data is the default data from precompute_data.
  #
  # @param [CourseUser] course_user The user to adjust the personalized timeline for.
  # @param [Hash] precomputed_data The default data precomputed by precompute_data.
  def execute(course_user, precomputed_data)
    return if precomputed_data[:learning_rate_ema].nil?

    # Apply the appropriate algo depending on student's leaning rate
    new_strategy = if precomputed_data[:learning_rate_ema] < 1
                     FomoPersonalizationStrategy.new
                   else
                     StragglersPersonalizationStrategy.new
                   end
    new_strategy.execute(course_user, precomputed_data)
  end
end
