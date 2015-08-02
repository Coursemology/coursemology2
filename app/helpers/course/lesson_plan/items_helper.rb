module Course::LessonPlan::ItemsHelper
  def milestone_period_class(item)
    'past' if item.start_at < Time.zone.now
  end

  def milestone_body_id(milestone)
    "milestone-#{milestone.id}-body"
  end

  def item_body_id(item)
    "item-#{item.class.name.underscore.dasherize.gsub('/', '_')}-#{item.id}-body"
  end
end
