module Extensions::AssociationInverseSuppression::ActiveRecord::Base
  module ClassMethods
    def add_userstamp_associations(options)
      options.reverse_merge!(inverse_of: false)
      super(options)
    end
  end
end
