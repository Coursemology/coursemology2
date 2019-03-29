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
      # Skip calling `add_userstamp_associations` in the gem during assets precompile.
      # The env variable RAILS_GROUPS is set to 'assets'.
      # https://github.com/lowjoel/activerecord-userstamp/blob/master/lib/active_record/userstamp/stampable.rb#L76
      # calls https://github.com/lowjoel/activerecord-userstamp/blob/master/lib/active_record/userstamp/utilities.rb#L31
      # which needs a database connection, needlessly complicating the build.
      super(options) unless ENV['RAILS_GROUPS'] == 'assets'
    end
  end
end
