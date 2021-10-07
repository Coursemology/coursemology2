# frozen_string_literal: true
module Course::Discussion::Post::RetrievalConcern
  extend ActiveSupport::Concern

  module ClassMethods
    def posted_by(user)
      where(creator: user)
    end

    def with_topic
      includes(:topic)
    end

    def with_parent
      includes(:parent)
    end
  end
end
