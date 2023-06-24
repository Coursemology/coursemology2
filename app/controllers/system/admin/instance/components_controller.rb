# frozen_string_literal: true
class System::Admin::Instance::ComponentsController < System::Admin::Instance::Controller
  before_action :settings

  def index
    respond_to do |format|
      format.html { render 'system/admin/instance/admin/index' }
      format.json
    end
  end

  def update
    if @settings.update(settings_components_params) && current_tenant.save!
      render 'index', status: :ok
    else
      head :bad_request
    end
  end

  private

  def settings_components_params
    params.require(:settings_components)
  end

  # Load our settings adapter to handle component settings
  def settings
    @settings ||= Instance::Settings::Components.new(current_tenant)
  end
end
