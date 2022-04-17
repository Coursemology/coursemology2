# frozen_string_literal: true
class Course::LessonPlan::Strategies::OtotPersonalizationStrategy <
  Course::LessonPlan::Strategies::BasePersonalizationStrategy
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

  protected

  def min_overall_limit(settings, learning_rate_ema)
    return settings.min_overall_limit if settings&.min_overall_limit

    if learning_rate_ema < 1
      Course::LessonPlan::Strategies::FomoPersonalizationStrategy::MIN_OVERALL_LIMIT
    else
      Course::LessonPlan::Strategies::StragglersPersonalizationStrategy::MIN_OVERALL_LIMIT
    end
  end

  def max_overall_limit(settings, learning_rate_ema)
    return settings.max_overall_limit if settings&.max_overall_limit

    if learning_rate_ema < 1
      Course::LessonPlan::Strategies::FomoPersonalizationStrategy::MAX_OVERALL_LIMIT
    else
      Course::LessonPlan::Strategies::StragglersPersonalizationStrategy::MAX_OVERALL_LIMIT
    end
  end

  def hard_min_learning_rate(settings, learning_rate_ema)
    return settings.hard_min_learning_rate if settings&.hard_min_learning_rate

    if learning_rate_ema < 1
      Course::LessonPlan::Strategies::FomoPersonalizationStrategy::HARD_MIN_LEARNING_RATE
    else
      Course::LessonPlan::Strategies::StragglersPersonalizationStrategy::HARD_MIN_LEARNING_RATE
    end
  end
end
