# frozen_string_literal: true
module RouteOverridesHelper
  class << self
    private

    def mapping_for(from, to)
      {
        from.to_s.singularize => to.to_s.singularize,
        from.to_s.pluralize => to.to_s.pluralize
      }
    end

    def map_route_helpers_with(mapping)
      ['_path', '_url'].each do |suffix|
        ['', 'new_', 'edit_'].each do |prefix|
          mapping.each do |from, to|
            define_method(prefix + from + suffix) do |*forwarded_args|
              send(prefix + to + suffix, *forwarded_args)
            end
          end
        end
      end
    end

    # Override route helper methods e.g. to remove the namespacing in the model class.
    #
    # @param from [Symbol, String] The route helper to be overridden. This helper could be generated
    #        by a form helper link_to but is not actually created from the route setup.
    # @param to [Symbol, String] The correct route to be used which is created by the route setup.
    def map_route(from, to:)
      mapping = mapping_for(from, to)
      map_route_helpers_with(mapping)
    end
  end

  map_route :course_course_user, to: :course_user
  map_route_helpers_with 'course_assessment_question_programmings' =>
                           'course_assessment_question_programming_index'
end
