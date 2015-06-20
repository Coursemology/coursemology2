module Course::LessonPlanItemsHelper
  def item_period_class(item)
    'past' if item.start_time < Time.now
  end

  def item_body_id(item)
    "item-#{item.class.name.underscore.dasherize.gsub('/', '_')}-#{item.id}-body"
  end
end
