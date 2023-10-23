# frozen_string_literal: true
module Signals::EmissionConcern
  extend ActiveSupport::Concern

  include ActiveSupport::Callbacks

  HEADER_KEY = 'Signals-Sync'

  module ClassMethods
    private

    def signals(slice_name, options = {})
      prepend_after_action (lambda do
        return unless response.successful?

        self.class.include(slice_class(slice_name))
        headers[HEADER_KEY] = send(generate_sync_method_name(slice_name))&.to_json
      rescue NameError
        return if Rails.env.production?

        raise NameError, "Slice :#{slice_name} not defined, expected #{slice_class_name(slice_name)}"
      end), only: options[:after], except: options[:except], if: options[:if]
    end
  end

  private

  def slice_class_name(slice_name)
    "Signals::Slices::#{slice_name.to_s.camelize}"
  end

  def slice_class(slice_name)
    slice_class_name(slice_name).constantize
  end

  def generate_sync_method_name(slice_name)
    "generate_sync_for_#{slice_name}".to_sym
  end
end
