# frozen_string_literal: true

# Counts unique active students per instance, bucketed by month or year (UTC), from course_activity_marks. A student is
# active in a bucket if they have a mark in it, and is counted once per bucket however many courses they have. The
# overall count is distinct across instances, so it can be less than the sum of the instance counts.
#
# Marks outlive deleted users, courses and instances, so past counts do not shrink when those are deleted.
class System::Admin::ActivityStatisticsService
  GRANULARITIES = %w[month year].freeze
  BUCKET_FORMATS = { 'month' => ['YYYY-MM', '%Y-%m'], 'year' => ['YYYY', '%Y'] }.freeze

  # @return [Integer|nil] The year of the earliest mark, or nil if there are none.
  def self.first_year
    Course::ActivityMark.minimum(:month)&.year
  end

  # @param [String] granularity Either 'month' or 'year'.
  # @param [Integer] from_year The first year to count, inclusive.
  # @param [Integer] to_year The last year to count, inclusive.
  def initialize(granularity:, from_year:, to_year:)
    @granularity = granularity
    @from = Time.utc(from_year)
    @to = Time.utc(to_year + 1)
  end

  # @return [Array<String>] The bucket labels in order, e.g. '2026-01' or '2026'.
  def buckets
    @buckets ||= bucket_starts.map { |start| start.strftime(BUCKET_FORMATS[@granularity].last) }
  end

  # @return [String|nil] The label of the latest bucket that has fully elapsed.
  def last_complete_bucket
    buckets.zip(bucket_starts).reverse.find { |_, start| next_bucket_start(start) <= Time.current }&.first
  end

  # @param [Integer] instance_id
  # @return [Array<Integer|nil>] The instance's counts aligned with +buckets+. Buckets that have
  #   not started yet are nil.
  def counts_for(instance_id)
    bucket_starts.zip(buckets).map do |start, label|
      (start > Time.current) ? nil : totals.fetch([instance_id, label], 0)
    end
  end

  # @return [Array<Integer|nil>] The unique students across all instances, aligned with +buckets+.
  def overall
    counts_for(nil)
  end

  private

  def bucket_starts
    @bucket_starts ||= begin
      starts = [@from]
      starts << next_bucket_start(starts.last) while next_bucket_start(starts.last) < @to
      starts
    end
  end

  def next_bucket_start(start)
    (@granularity == 'month') ? start.next_month : start.next_year
  end

  def totals
    # The overall rows come back with a NULL instance id.
    @totals ||= ActiveRecord::Base.connection.select_rows(totals_sql).to_h do |instance_id, label, total|
      [[instance_id&.to_i, label], total.to_i]
    end
  end

  # Served from index_course_activity_marks_on_month_instance_user alone.
  def totals_sql
    ActiveRecord::Base.sanitize_sql_array([<<~SQL, totals_params])
      SELECT instance_id, to_char(date_trunc(:unit, month), :label_format) AS bucket,
             COUNT(DISTINCT user_id) AS total
      FROM course_activity_marks
      WHERE month >= :from AND month < :to
      GROUP BY GROUPING SETS ((instance_id, date_trunc(:unit, month)), (date_trunc(:unit, month)))
    SQL
  end

  def totals_params
    {
      unit: @granularity,
      label_format: BUCKET_FORMATS[@granularity].first,
      from: @from.to_date,
      to: @to.to_date
    }
  end
end
