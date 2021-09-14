# frozen_string_literal: true
class Course::Settings::Sidebar
  include ActiveModel::Model
  include ActiveModel::Conversion

  attr_reader :sidebar_items

  # @param [#settings] course_settings The settings object provided by the settings_on_rails gem.
  # @param [Array<Hash>] sidebar_items The sidebar items.
  def initialize(course_settings, sidebar_items)
    @settings = course_settings.settings(:sidebar)
    @sidebar_items = begin
      sidebar_items = sidebar_items.map do |item|
        Course::Settings::SidebarItem.new(@settings, item)
      end
      sidebar_items.sort_by(&:weight)
    end
  end

  # Update settings with the hash attributes
  #
  # @param [Hash] attributes The hash who stores the new settings
  def update(attributes)
    attributes.each { |k, v| public_send("#{k}=", v) }
    valid?
  end

  # Read order from attributes and change the order of sidebar items.
  #
  # @param [Array<Hash>] attributes the attributes which indicates the new order.
  def sidebar_items_attributes=(attributes)
    attributes.each_value do |attribute|
      key = attribute[:id]
      new_weight = attribute[:weight].to_i
      @settings.settings(key).weight = new_weight
    end
  end

  def persisted? # :nodoc:
    true
  end

  def valid? # :nodoc:
    sidebar_items.all?(&:valid?)
  end
end
