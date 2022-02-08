# frozen_string_literal: true
module Course::Group::GroupManagerConcern
  extend ActiveSupport::Concern
  def manageable_groups
    @manageable_groups ||= current_course.groups.accessible_by(current_ability, :manage)
  end

  def viewable_group_categories
    @viewable_group_categories ||= current_course.group_categories.accessible_by(current_ability)
  end
end
