class Course::Settings::SidebarItem
  include ActiveModel::Model
  include ActiveModel::Validations

  validates :weight, numericality: { greater_than: 0 }

  # @param [#settings] settings The scoped settings object.
  # @param [Hash] sidebar_item The hash which contains the attributes of sidebar item.
  def initialize(settings, sidebar_item)
    @settings = settings
    @sidebar_item = sidebar_item
  end

  # @return [String] The unique id(key) of the item.
  def id
    @sidebar_item[:key]
  end

  # @return [String] The title of the item.
  def title
    @sidebar_item[:title]
  end

  # @return [Fixnum] The weight of the item.
  def weight
    result = @settings.settings(id).weight if id
    result || @sidebar_item[:weight]
  end
end
