module Extensions::Attachable::ActionController::Base
  module ClassMethods
    # Declared this function in controller to let it accepts attachments.
    # Should be declared after load_and_authorize_resources.
    def accepts_attachments
      before_action :build_attachments, only: [:new, :edit]
    end
  end

  # Permit attachments params in strong parameters.
  # @return [Hash] The params required by the framework.
  def attachments_params
    { attachments_attributes: [:id, :attachment, :attachment_cache, :_destroy] }
  end

  private

  def build_attachments
    @attachable = instance_variable_get('@' + attachable_item_name)
    @attachable.attachments.build if @attachable
  end

  def attachable_item_name
    params[:controller].split('/').last.singularize
  end
end
