# frozen_string_literal: true
class Course::LessonPlan::Strategies::OtotPersonalizationStrategy <
  Course::LessonPlan::Strategies::BasePersonalizationStrategy
  # Returns precomputed data for the given course user.
  # This method is identical to that of BasePersonalizationStrategy except for the fact that the effective
  # learning rate is constrained based on limits determined by the initial learning rate.
  #
  # @param [CourseUser] course_user The course user to compute data for.
  # @return [Hash] Precomputed data to aid execution.
  def precompute_data(course_user) # rubocop:disable Metrics/AbcSize, Metrics/MethodLength
    submitted_items = lesson_plan_items_submission_time_hash(course_user)
    items = lesson_plan_items_with_sorted_times_for(course_user)
    items_affecting_personal_times = items.select(&:affects_personal_times?)
    learning_rate_ema = compute_learning_rate_ema(
      course_user, items_affecting_personal_times, submitted_items, self.class::LEARNING_RATE_ALPHA
    )
    unless learning_rate_ema.nil?
      strategy = if learning_rate_ema < 1
                   Course::LessonPlan::Strategies::FomoPersonalizationStrategy
                 else
                   Course::LessonPlan::Strategies::StragglersPersonalizationStrategy
                 end
      effective_min, effective_max = compute_learning_rate_effective_limits(course_user, items, submitted_items,
                                                                            strategy::MIN_LEARNING_RATE,
                                                                            strategy::MAX_LEARNING_RATE)
      bounded_learning_rate_ema = [strategy::HARD_MIN_LEARNING_RATE, effective_min,
                                   [learning_rate_ema, effective_max].min].max
    end

    { submitted_items: submitted_items, items: items, learning_rate_ema: bounded_learning_rate_ema,
      original_learning_rate_ema: learning_rate_ema, effective_min: effective_min, effective_max: effective_max }
  end

  # Applies the appropriate algorithm strategy for the student based on the student's learning rate.
  #
  # The expected precomputed_data is the default data from precompute_data.
  #
  # @param [CourseUser] course_user The user to adjust the personalized timeline for.
  # @param [Hash] precomputed_data The default data precomputed by precompute_data.
  # @param [Set<Number>|nil] items_to_shift Set of item ids to shift. If provided, only items with ids in this set will
  #   be shifted.
  def execute(course_user, precomputed_data, items_to_shift = nil)
    return if precomputed_data[:learning_rate_ema].nil?

    # Apply the appropriate algo depending on student's original learning rate
    new_strategy = if precomputed_data[:original_learning_rate_ema] < 1
                     Course::LessonPlan::Strategies::FomoPersonalizationStrategy.new
                   else
                     Course::LessonPlan::Strategies::StragglersPersonalizationStrategy.new
                   end
    new_strategy.execute(course_user, precomputed_data, items_to_shift)
  end
end
