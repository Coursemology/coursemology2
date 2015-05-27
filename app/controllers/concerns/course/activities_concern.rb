module Course::ActivitiesConcern
  extend ActiveSupport::Concern

  # Load recent activity feeds
  #
  # @param [Course] course course which activities are related to
  # @param [Hash]
  # @option [Integer] :number The number of activities that will be loaded
  #
  # @return [Array<Activity>]
  def recent_activities(course, number: false)
    if number
      Activity.where(owner: course).where.not('key like ?', '%notify').
        order('created_at desc').includes(:trackable, :recipient).first(number)
    else
      Activity.where(owner: course).where.not('key like ?', '%notify').
        order('created_at desc').includes(:trackable, :recipient)
    end
  end
end
