module Extensions::Attachable::ActionController::Base
  # Permit attachments params in strong parameters.
  # @return [Hash] The params required by the framework.
  def attachments_params
    [:file, files: []]
  end
  alias_method :attachment_params, :attachments_params
end
