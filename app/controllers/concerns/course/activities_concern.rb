module Course::ActivitiesConcern
  extend ActiveSupport::Concern

  # Load recent activity feeds
  #
  # @param [Course] course course which activities are related to
  # @param [Integer] number number of activities that will be loaded
  #
  # @return [Array<Activity>]
  def recent_activities(course, count: nil)
    result = Activity.joins(:notification).where(notifications: { activity_feed: true }).
             where(owner: course).order(created_at: :desc).includes(:trackable, :recipient)
    result = result.first(count) unless count.nil?
    result
  end
end
