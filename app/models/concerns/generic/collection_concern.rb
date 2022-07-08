# frozen_string_literal: true

module Generic::CollectionConcern
  extend ActiveSupport::Concern

  included do
    scope :paginated, lambda { |params|
      page_number = params.fetch(:page_num, 1)
      limit = params.fetch(:length, 25)
      offset = params.fetch(:start, (page_number.to_f - 1) * limit)
      limit(limit).offset(offset)
    }
  end
end
  