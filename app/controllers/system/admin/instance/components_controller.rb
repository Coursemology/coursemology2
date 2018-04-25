# frozen_string_literal: true
class System::Admin::Instance::ComponentsController < System::Admin::Instance::Controller
  before_action :load_settings
  add_breadcrumb :edit, :admin_instance_components_path

  def edit #:nodoc:
  end

  def update #:nodoc:
    if @settings.update(settings_components_params) && current_tenant.save!
      redirect_to admin_instance_components_path, success: t('.success')
    else
      render 'edit'
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
