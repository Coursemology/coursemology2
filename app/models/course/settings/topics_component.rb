# frozen_string_literal: true
class Course::Settings::TopicsComponent
  include ActiveModel::Model
  include ActiveModel::Conversion
  include ActiveModel::Validations

  validates :pagination, numericality: { greater_than: 0, less_than_or_equal_to: 50 }

  def initialize(settings)
    @settings = settings
  end

  def title
    @settings.title
  end

  def title=(title)
    title = nil unless title.present?
    @settings.title = title
  end

  def pagination
    @settings.pagination || 10
  end

  def pagination=(count)
    @settings.pagination = count
  end

  def update(attributes)
    attributes.each { |k, v| send("#{k}=", v) }
    valid?
  end

  def persisted?
    # For simple_form to generate correct button text ( Update instead of Create ).
    true
  end
end
