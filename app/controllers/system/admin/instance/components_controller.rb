class System::Admin::Instance::ComponentsController < System::Admin::Instance::Controller
  before_action :load_settings
  add_breadcrumb :edit, :admin_instance_components_path

  def edit #:nodoc:
  end

  def update #:nodoc:
    @settings.update(params.require(:settings_effective))
    if current_tenant.save
      redirect_to admin_instance_components_path, success: t('.success')
    else
      @settings.errors = current_tenant.errors
      render 'edit'
    end
  end

  private

  # Load our settings adapter to handle component settings
  def load_settings
    @settings = Instance::Settings::Effective.new(current_tenant, Course::ComponentHost)
  end
end
