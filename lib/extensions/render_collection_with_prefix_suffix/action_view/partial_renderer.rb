# frozen_string_literal: true
module Extensions::RenderCollectionWithPrefixSuffix::ActionView::PartialRenderer
  module PrependMethods
    # Adds support for the +prefix+ and +suffix+ options to {render partial:}.
    #
    # This allows for a prefix or suffix to be specified when rendering a polymorphic collection, so
    # that different partials can be used for different contexts.
    #
    # @example Rendering a collection of objects
    #   @collection = [event, assessment]
    #   render partial: @collection, prefix: 'lesson_plan'
    #   # Renders event/_lesson_plan_event.html
    #   # Renders assessment/_lesson_plan_assessment.html
    def partial_path(*)
      result = super
      return result unless @options.key?(:prefix) || @options.key?(:suffix)

      dirname, basename = File.split(result)
      basename.prepend("#{@options[:prefix]}_") if @options.key?(:prefix)
      basename.concat("_#{@options[:suffix]}") if @options.key?(:suffix)
      File.join(dirname, basename)
    end
  end
end
