# frozen_string_literal: true
class System::Admin::ActivitiesController < System::Admin::Controller
  # How long the browser may reuse a response without asking again. Past years only change when they are backfilled;
  # anything covering the current year can gain marks.
  CLOSED_PERIOD_BROWSER_TTL = 1.day
  CURRENT_PERIOD_BROWSER_TTL = 1.hour

  # The client adds a `viewer_id` param that is not read here. It only keys the browser cache per
  # user, since that cache is keyed by URL and would otherwise serve one account's response to
  # another account in the same browser without reaching this authorization check.
  def statistics
    ActsAsTenant.without_tenant do
      # The year of the earliest mark: the yearly view starts here, the monthly view cannot go earlier, and the monthly
      # view has no previous year to compare against in it.
      @first_year = System::Admin::ActivityStatisticsService.first_year || Time.current.year
      granularity = params[:granularity].presence || 'month'
      from_year, to_year = year_range(granularity)

      unless valid_params?(granularity, from_year)
        return render json: { error: 'Invalid statistics parameters' }, status: :bad_request
      end

      @statistics = System::Admin::ActivityStatisticsService.new(
        granularity: granularity, from_year: from_year, to_year: to_year
      )
      @previous_statistics = previous_year_statistics(granularity, from_year)
      @granularity = granularity
      @instances = Instance.order_for_display.to_a
      expires_in browser_cache_ttl(to_year)
    end
  end

  private

  def year_range(granularity)
    return [@first_year, Time.current.year] unless granularity == 'month'

    year = parse_year(params[:year]) || Time.current.year
    [year, year]
  end

  # The same months a year earlier, for comparison in the monthly view.
  def previous_year_statistics(granularity, year)
    return nil unless granularity == 'month' && year > @first_year

    System::Admin::ActivityStatisticsService.new(granularity: 'month', from_year: year - 1, to_year: year - 1)
  end

  def browser_cache_ttl(to_year)
    (to_year < Time.current.year) ? CLOSED_PERIOD_BROWSER_TTL : CURRENT_PERIOD_BROWSER_TTL
  end

  def parse_year(value)
    Integer(value, 10) if value.present?
  rescue ArgumentError, TypeError
    -1
  end

  def valid_params?(granularity, from_year)
    System::Admin::ActivityStatisticsService::GRANULARITIES.include?(granularity) && from_year >= @first_year
  end
end
