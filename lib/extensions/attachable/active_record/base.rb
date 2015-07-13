module Extensions::Attachable::ActiveRecord::Base
  module ClassMethods
    # This function should be declared in model, to it have attachments.
    def acts_as_attachable
      has_many :attachments, as: :attachable, inverse_of: :attachable

      accepts_nested_attributes_for :attachments,
                                    allow_destroy: true,
                                    reject_if: -> (params) { params[:attachment].blank? }
    end
  end
end
