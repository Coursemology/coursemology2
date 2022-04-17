# frozen_string_literal: true
# The BasePersonalizationStrategy declares operations common to all, if not most, personalized timeline algorithms.
# It also defines the interface to use when calling the algorithm defined by the subclasses.
class Course::LessonPlan::Strategies::BasePersonalizationStrategy
  include Course::LessonPlan::LearningRateConcern
  # To override any of these constants, simply define the same constant in the subclass.
  LEARNING_RATE_ALPHA = 0.4
  MIN_OVERALL_LIMIT = 1.0 # The fastest that a student can finish a course
  MAX_OVERALL_LIMIT = 1.0 # The slowest that a student can finish a course
  HARD_MIN_LEARNING_RATE = 1.0
  # How generously we round off. E.g. if `threshold` = 0.5, then a datetime with a time of > 0.5 * 1.day will be
  # snapped to the next day.
  DATE_ROUNDING_THRESHOLD = 0.5

  # Returns precomputed data for the given course user.
  # The data returned depends on the strategy requirements, and will need to be of the same format
  # that the execute method accepts.
  #
  # By default, the data returned is a hash containing {
  #   items: Array<Course::LessonPlan::Item>,
  #   submitted_items: Hash{Integer=>DateTime or nil},
  #   learning_rate_ema: Float|nil
  # }
  # where items is a sorted array of lesson plan items based on the course_user start_at,
  # submitted_items is a hash of the user's submitted lesson plan items to the submission time (if available),
  # and learning_rate_ema is a learning rate exponential moving average, bounded based on algorithm specifications.
  #
  # @param [CourseUser] course_user The course user to compute data for.
  # @return [Hash] Precomputed data to aid execution.
  def precompute_data(course_user) # rubocop:disable Metrics/AbcSize, Metrics/MethodLength
    submitted_items = lesson_plan_items_submission_time_hash(course_user)
    items = course_user.course.lesson_plan_items.published.
            with_reference_times_for(course_user).
            with_personal_times_for(course_user).
            to_a
    items = items.sort_by { |x| x.time_for(course_user).start_at }
    items_affecting_personal_times = items.select(&:affects_personal_times?)
    learning_rate_ema = compute_learning_rate_ema(
      course_user, items_affecting_personal_times, submitted_items, self.class::LEARNING_RATE_ALPHA
    )
    unless learning_rate_ema.nil?
      settings = course_user.course.settings_personalized_timeline
      effective_min, effective_max = compute_learning_rate_effective_limits(
        course_user, items, submitted_items,
        min_overall_limit(settings, learning_rate_ema),
        max_overall_limit(settings, learning_rate_ema)
      )
      bounded_learning_rate_ema = [hard_min_learning_rate(settings, learning_rate_ema), effective_min,
                                   [learning_rate_ema, effective_max].min].max
      if settings&.hard_max_learning_rate
        bounded_learning_rate_ema = [bounded_learning_rate_ema,
                                     settings.hard_max_learning_rate].min
      end
    end

    { submitted_items: submitted_items, items: items, learning_rate_ema: bounded_learning_rate_ema,
      original_learning_rate_ema: learning_rate_ema, effective_min: effective_min, effective_max: effective_max }
  end

  # Executes the relevant personalization strategy for the given course user, using the given precomputed
  # data.
  #
  # @param [CourseUser] course_user The course user to execute the strategy on.
  # @param [Hash|nil] precomputed_data Data to determine strategy execution.
  # @param [Set<Number>|nil] items_to_shift Set of item ids to shift. If provided, only items with ids in this set will
  #   be shifted.
  def execute(_course_user, _precomputed_data, _items_to_shift = nil)
    raise NotImplementedError, 'Subclasses must implmement a execute method.'
  end

  protected

  def min_overall_limit(settings, _learning_rate_ema)
    settings&.min_overall_limit || self.class::MIN_OVERALL_LIMIT
  end

  def max_overall_limit(settings, _learning_rate_ema)
    settings&.max_overall_limit || self.class::MAX_OVERALL_LIMIT
  end

  def hard_min_learning_rate(settings, _learning_rate_ema)
    settings&.hard_min_learning_rate || self.class::HARD_MIN_LEARNING_RATE
  end

  # Round to "nearest" date in course's timezone, NOT user's timezone.
  #
  # @param [ActiveSupport::TimeWithZone] datetime The datetime object to round.
  # @param [String] course_tz The timezone of the course.
  # @param [Boolean] to_2359 Whether to round off to 2359. This will set the datetime to be 2359 of the date before the
  #   rounded date.
  def round_to_date(datetime, course_tz, to_2359: false)
    prev_day = datetime.in_time_zone(course_tz).to_date.in_time_zone(course_tz).in_time_zone
    date = ((datetime - prev_day) < self.class::DATE_ROUNDING_THRESHOLD ? prev_day : prev_day + 1.day)
    to_2359 ? date - 1.minute : date
  end
end
