# frozen_string_literal: true
module Course::ObjectDuplicationsHelper
  # Map of keys of components with cherry-pickable items to tokens for those components in the frontend.
  def cherrypickable_components_hash
    @cherrypickable_components_hash ||= {
      course_assessments_component: 'ASSESSMENTS',
      course_survey_component: 'SURVEYS',
      course_achievements_component: 'ACHIEVEMENTS',
      course_materials_component: 'MATERIALS',
      course_videos_component: 'VIDEOS'
    }.freeze
  end

  # @param [Course] course
  # @return [Array<String>] Frontend-based strings representing the enabled components for the given course.
  def enabled_component_tokens(course)
    context = OpenStruct.new(current_course: course)
    component_host = Course::ControllerComponentHost.new(
      course.instance.settings(:components), course.settings(:components), context
    )
    map_components_to_frontend_tokens(component_host.components)
  end

  # @param [Course::ControllerComponentHost::Component] components
  # @return [Array<String>] Frontend-based strings representing the given components.
  def map_components_to_frontend_tokens(components)
    components.map(&:key).map { |key| cherrypickable_components_hash[key] }.compact
  end
end
