# frozen_string_literal: true
module SafeMarkAsReadConcern
  extend ActiveSupport::Concern

  def safely_mark_as_read!(options)
    mark_as_read!(options)
  rescue ActiveRecord::RecordNotUnique
    raise if unread?(options[:for])
  end
end
