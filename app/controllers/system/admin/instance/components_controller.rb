# frozen_string_literal: true
class System::Admin::Instance::ComponentsController < System::Admin::Instance::Controller
  before_action :load_settings
  add_breadcrumb :edit, :admin_instance_components_path

  def edit # :nodoc:
    respond_to do |format|
      format.html { render 'system/admin/instance/admin/index' }
      format.json { render 'system/admin/instance/components/index' }
    end
  end

  def update # :nodoc:
    if @settings.update(settings_components_params) && current_tenant.save!
      render 'system/admin/instance/components/index',
             status: :ok
    else
      head :bad_request
    end
  end

  private

  def settings_components_params
    params.require(:settings_components)
  end

  # Load our settings adapter to handle component settings
  def load_settings
    @settings ||= Instance::Settings::Components.new(current_tenant)
  end
end
