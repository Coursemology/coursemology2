# frozen_string_literal: true
module Course::LessonPlanConcern
  extend ActiveSupport::Concern

  # Groups lesson plan items by their milestone.
  #
  # This combines the lesson plan milestones with the items, grouping them by milestone.
  #
  # There may be a special key, +nil+ for items which do not come under a milestone.
  #
  # @return [Hash{Course::LessonPlan::Milestone,nil=>Array<Course::LessonPlanItem>}]
  #   The items grouped by key, with a nil key indicating items not belonging to any milestone.
  def grouped_lesson_plan_items_with_milestones
    milestones = lesson_plan_milestones.ordered_by_date.to_a
    items = lesson_plan_items.where.not(id: lesson_plan_items.where(actable_type: Course::LessonPlan::Milestone.name)).
            ordered_by_date.to_a

    group_lesson_plan_items_with_milestones(milestones, items)
  end

  private

  # Groups the given items against the given set of milestones.
  #
  # @param [Array<Course::LessonPlan::Milestone] milestones The milestones in the lesson plan.
  #   These milestones must be sorted in chronological order.
  # @param [Array<Course::LessonPlan::Item] items The items in the lesson plan.
  #   These items must be sorted in chronological order.
  # @return [Hash{Course::LessonPlan::Milestone,nil=>Array<Course::LessonPlanItem>}]
  def group_lesson_plan_items_with_milestones(milestones, items)
    current_milestone = nil
    milestones_hash = Hash.new { |h, k| h[k] = [] }
    milestones.each { |m| milestones_hash[m] }

    items.each_with_object(milestones_hash) do |item, result|
      while !milestones.empty? && milestones.first.start_at < item.start_at
        current_milestone = milestones.shift
      end

      result[current_milestone] << item
    end
  end
end
