module Course::ActivitiesConcern
  extend ActiveSupport::Concern

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
