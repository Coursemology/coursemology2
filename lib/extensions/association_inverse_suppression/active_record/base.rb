# frozen_string_literal: true
module Extensions::AssociationInverseSuppression::ActiveRecord::Base
  module ClassMethods
    def add_userstamp_associations(options)
      options.reverse_merge!(inverse_of: false)
      super(options)
    end

    # Subclasses +acts_as+ to automatically inject the +inverse_of+ option.
    def acts_as(*args)
      options = args.extract_options!
      options.reverse_merge!(inverse_of: :actable)

      args.push(options)
      super(*args)
    end
  end
end
