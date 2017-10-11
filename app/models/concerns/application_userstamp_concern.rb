# frozen_string_literal: true
module ApplicationUserstampConcern
  extend ActiveSupport::Concern

  module ClassMethods
    # Bring forward the userstamp association definitions
    # TODO: Remove after lowjoel/activerecord-userstamp#27 is closed
    def inherited(klass)
      super

      klass.class_eval do
        add_userstamp_associations({})
      end
    end

    def add_userstamp_associations(options)
      options.reverse_merge!(inverse_of: false)
      super(options)
    end
  end
end
