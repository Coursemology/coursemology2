module Extensions::ActiveRecord::Base
  module ClassMethods
    def currently_valid
      where do
        (valid_from.nil? || valid_from <= DateTime.now) &&
          (valid_to.nil? || valid_to >= DateTime.now)
      end
    end

    # Functions from ActsAsAttachable framework.
    # This function should be declared in model, to it have attachments.
    def acts_as_attachable
      has_many :attachments, as: :attachable

      accepts_nested_attributes_for :attachments,
                                    allow_destroy: true,
                                    reject_if: -> (params) { params[:attachment].blank? }
    end
  end

  # @return [Bool] True if valid_from is a future time
  def not_yet_valid?
    !valid_from.nil? && valid_from > DateTime.now
  end

  # @return [Bool] True if current time is between valid_from and valid_to
  def currently_valid?
    (valid_from.nil? || valid_from <= DateTime.now) &&
      (valid_to.nil? || valid_to >= DateTime.now)
  end

  # @return [Bool] True if valid_to is a past time
  def expired?
    !valid_to.nil? && DateTime.now > valid_to
  end
end
