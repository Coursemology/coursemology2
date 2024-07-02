# frozen_string_literal: true
module Extensions::DuplicationTraceable::ActiveRecord::Base
  module ClassMethods
    def acts_as_duplication_traceable
      acts_as :duplication_traceable, class_name: 'DuplicationTraceable'

      extend DuplicationTraceableClassMethods
      include DuplicationTraceableInstanceMethods
    end
  end

  module DuplicationTraceableClassMethods
    def dependent_class
      raise NotImplementedError, 'Subclasses must implement a dependent_class method.'
    end

    # Default initializer used by duplicator.
    def initialize_with_dest(_dest, **_options)
      raise NotImplementedError, 'Subclasses must implement a #initialize_with_dest method.'
    end
  end

  module DuplicationTraceableInstanceMethods
    extend ActiveSupport::Concern

    included do
      validate :source_exists
    end

    # Returns the source object, if any.
    def source
      source_id && self.class.dependent_class.constantize.find(source_id)
    end

    # Sets the source id.
    def source=(item)
      self.source_id = item&.id
    end

    private

    def source_exists
      source
    rescue ActiveRecord::RecordNotFound
      errors.add(:source_id, I18n.t('activerecord.errors.models.duplication_traceable.attributes.source_id.must_exist'))
    end
  end
end
