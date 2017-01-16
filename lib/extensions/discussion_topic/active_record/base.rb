# frozen_string_literal: true
module Extensions::DiscussionTopic::ActiveRecord::Base
  module ClassMethods
    # Declare this in model, for it to support discussions.
    #
    # @option options [Boolean] :display_globally Set to true if the topic need to be displayed in
    # comments center.
    # @option options [Boolean] :touch Set to true if the topic need to be touched upon updating.
    def acts_as_discussion_topic(display_globally: false, touch: false)
      acts_as :discussion_topic, class_name: Course::Discussion::Topic.name, touch: touch
      # For autoload to work correctly after class changed, we store the model name first and
      # constantize later.
      Course::Discussion::Topic.global_topic_model_names << name if display_globally
    end
  end
end
