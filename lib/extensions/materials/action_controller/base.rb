# frozen_string_literal: true
module Extensions::Materials::ActionController::Base
  # Permit attachments params in strong parameters.
  # @return [Hash] The params required by the framework.
  def folder_params
    { files_attributes: [] }
  end
end
