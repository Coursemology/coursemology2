# frozen_string_literal: true
module Extensions::Duplicable::ActiveRecord::Base
  module ClassMethods
    # This function should be declared in model, to make it duplicable.
    def acts_as_duplicable
      include ActsAsDuplicable
    end
  end

  module ActsAsDuplicable
    # Overridden by the model to duplicate its children.
    #
    # @param _duplicator [Duplicator] Duplicator object for checking if objects
    #   have been duplicated.
    # @param _other [Object] Source object whose children are to be duplicated.
    def initialize_duplicate(_duplicator, _other)
      raise NotImplementedError, 'Implement your own initialize_duplicate method for this model.'
    end
  end
end
