# frozen_string_literal: true
# The BasePersonalizationStrategy declares operations common to all, if not most, personalized timeline algorithms.
# It also defines the interface to use when calling the algorithm defined by the subclasses.
class BasePersonalizationStrategy
  # To override any of these constants, simply define the same constant in the subclass.
  LEARNING_RATE_ALPHA = 0.4
  MIN_LEARNING_RATE = 1.0
  MAX_LEARNING_RATE = 1.0
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
  def precompute_data(course_user)
    submitted_items = lesson_plan_items_submission_time_hash(course_user)
    items = course_user.course.lesson_plan_items.published.
            with_reference_times_for(course_user).
            with_personal_times_for(course_user).
            to_a
    items = items.sort_by { |x| x.time_for(course_user).start_at }
    items_affecting_personal_times = items.select(&:affects_personal_times?)
    learning_rate_ema = compute_learning_rate_ema(
      course_user, items_affecting_personal_times, submitted_items
    )
    unless learning_rate_ema.nil?
      effective_min, effective_max = compute_learning_rate_effective_limits(course_user, items, submitted_items)
      learning_rate_ema = [self.class::HARD_MIN_LEARNING_RATE, effective_min,
                           [learning_rate_ema, effective_max].min].max
    end

    { submitted_items: submitted_items, items: items, learning_rate_ema: learning_rate_ema }
  end

  # Executes the relevant personalization strategy for the given course user, using the given precomputed
  # data.
  #
  # @param [CourseUser] course_user The course user to execute the strategy on.
  # @param [Hash|nil] precomputed_data Data to determine strategy execution.
  def execute(_course_user, _precomputed_data)
    raise NotImplementedError, 'Subclasses must implmement a execute method.'
  end

  protected

  # Returns { lesson_plan_item_id => submitted_time or nil }.
  # If the lesson plan item is a key in this hash then we consider the item "submitted" regardless of whether we have a
  # submission time for it.
  #
  # @param [CourseUser] course_user The course user to compute the lesson plan items submission time hash for.
  # @return [Hash{Integer=>ActiveSupport::TimeWithZone|nil}] A hash of submitted lesson plan items' ID to their
  #   submitted time, if relevant/available.
  def lesson_plan_items_submission_time_hash(course_user)
    lesson_plan_items_submission_time_hash = {}
    # Extend this if more lesson plan items to personalize are added in the future.
    merge_course_assessments(lesson_plan_items_submission_time_hash, course_user)
    merge_course_videos(lesson_plan_items_submission_time_hash, course_user)
  end

  # Computes the learning rate exponential moving average for the given course user.
  #
  # @param [CourseUser] course_user The course user to compute the learning rate for.
  # @param [Array<Course::LessonPlan::Item>] items_affecting_personal_times An array of lesson plan items that affect
  #   personal times, sorted by the start_at for the given user, i.e. via time_for(course_user).start_at.
  # @param [Hash{Integer=>ActiveSupport::TimeWithZone|nil}] submitted_items A hash of submitted lesson plan items' ID to
  #   their submitted time, if relevant/available.
  # @return [Float|nil] Learning rate exponential moving average, if computable.
  def compute_learning_rate_ema(course_user, items_affecting_personal_times, submitted_items) # rubocop:disable Metrics/AbcSize
    submitted_items_affecting_personal_times = items_affecting_personal_times.
                                               select { |i| i.id.in? submitted_items.keys }.
                                               select { |i| i.time_for(course_user).end_at.present? }
    return nil if submitted_items_affecting_personal_times.empty?

    learning_rate_ema = 1.0
    # Currently, for the item to affect learning rate, it needs to have an end_at timing.
    # In the future, we may want to consider other ways of computing how much an item affects learning rate.
    submitted_items_affecting_personal_times.each do |item|
      times = item.time_for(course_user)
      next if times.end_at - times.start_at == 0 || submitted_items[item.id].nil?

      learning_rate = (submitted_items[item.id] - times.start_at) / (times.end_at - times.start_at)
      learning_rate = [learning_rate, 0].max
      learning_rate_ema = (self.class::LEARNING_RATE_ALPHA * learning_rate) +
                          ((1 - self.class::LEARNING_RATE_ALPHA) * learning_rate_ema)
    end
    learning_rate_ema
  end

  # Bounds the learning rate based on a given min and max learning rate.
  # Min/max overall learning rate refers to how early/late a student is allowed to complete the course.
  #
  # E.g. if max_overall_lr = 2 means a student is allowed to complete a 1-month course over 2 months.
  # However, if the student somehow managed to complete half of the course within the first day, then we can allow him
  # to continue at lr = 4 and still have the student complete the course over 2 months. This method computes the
  # effective limits to preserve the overall min/max lr.
  #
  # NOTE: It is completely possible for negative results (even -infinity), i.e. student needs to go back in time in
  # order to have any hope of completing the course within the limits. The algorithm needs to take care of this.
  #
  # @param [CourseUser] course_user The course user to compute the learning rate for.
  # @param [Array<Course::LessonPlan::Item>] items An array of lesson plan items for the course user's course,
  #   sorted by the start_at for the given user, i.e. via time_for(course_user).start_at.
  # @param [Hash{Integer=>ActiveSupport::TimeWithZone|nil}] submitted_items A hash of submitted lesson plan items' ID to
  #   their submitted time, if relevant/available.
  # @return [Array<Float>] An array pair containing [min learning rate, max learning rate].
  def compute_learning_rate_effective_limits(course_user, items, submitted_items) # rubocop:disable Metrics/AbcSize
    byebug
    course_start = items.first.start_at
    course_end = items.last.start_at
    last_submitted_item = items.reverse_each.lazy.
                          # TODO: Look into whether there's a need to filter on affects_personal_times?
                          select { |item| item.affects_personal_times? && item.id.in?(submitted_items.keys) }.
                          first
    return [self.class::MIN_LEARNING_RATE, self.class::MAX_LEARNING_RATE] if last_submitted_item.nil?

    reference_remaining_time = items.last.start_at - last_submitted_item.reference_time_for(course_user).start_at
    min_remaining_time = course_start + (self.class::MIN_LEARNING_RATE * (course_end - course_start)) -
                         last_submitted_item.time_for(course_user).start_at
    max_remaining_time = course_start + (self.class::MAX_LEARNING_RATE * (course_end - course_start)) -
                         last_submitted_item.time_for(course_user).start_at

    [min_remaining_time / reference_remaining_time, max_remaining_time / reference_remaining_time]
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

  private

  # Merges course assessment submissions into the given hash, with the following format:
  # { lesson_plan_item_id => submitted_time }
  #
  # @param [Hash{Integer=>ActiveSupport::TimeWithZone|nil}] hash A hash of submitted lesson plan items' ID to their
  #   submitted time, if relevant/available.
  # @param [CourseUser] course_user Course user to retrieve course assessments for.
  # @return [Hash{Integer=>ActiveSupport::TimeWithZone|nil}] Data with course assessment submission data merged in.
  def merge_course_assessments(hash, course_user)
    # Assessments - consider submitted only if submitted_at is present
    hash.merge!(
      course_user.course.assessments.
      with_submissions_by(course_user.user).
      select { |x| x.submissions.present? && x.submissions.first.submitted_at.present? }.
      map { |x| [x.lesson_plan_item.id, x.submissions.first.submitted_at] }.to_h
    )
  end

  # Merges course video submissions into the given hash, with the following format:
  # { lesson_plan_item_id => nil }
  #
  # @param [Hash{Integer=>ActiveSupport::TimeWithZone|nil}] hash A hash of submitted lesson plan items' ID to their
  #   submitted time, if relevant/available.
  # @param [CourseUser] course_user Course user to retrieve course videos for.
  # @return [Hash{Integer=>ActiveSupport::TimeWithZone|nil}] Data with course video submission data merged in.
  def merge_course_videos(hash, course_user)
    # Videos - consider submitted as long as submission exists
    hash.merge!(
      course_user.course.videos.
      with_submissions_by(course_user.user).
      select { |x| x.submissions.present? }.
      map { |x| [x.lesson_plan_item.id, nil] }.to_h
    )
  end
end
