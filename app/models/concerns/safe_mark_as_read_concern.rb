# frozen_string_literal: true
module SafeMarkAsReadConcern
  extend ActiveSupport::Concern

  def safely_mark_as_read!(options)
    unless respond_to?(:mark_as_read!) || Rails.env.production?
      raise "Did you have #{self.class.name} `acts_as_readable`?"
    end

    mark_as_read!(options)
  rescue ActiveRecord::RecordNotUnique
    raise if unread?(options[:for])
  end
end
