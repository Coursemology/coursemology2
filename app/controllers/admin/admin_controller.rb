class Admin::AdminController < Admin::Controller
  before_action :load_settings, only: [:components, :update_components]
  add_breadcrumb :components, :admin_components_path, if: :is_components_page?

  def index
  end

  def components #:nodoc:
  end

  def update_components #:nodoc:
    @settings.update(params.require(:instance_settings))
    if current_tenant.save
      redirect_to admin_components_path, success: t('.success')
    else
      @settings.errors = current_tenant.errors
      render 'components'
    end
  end

  private

  # Load our settings adapter to handle component settings
  def load_settings
    @settings = Instance::Settings.new(current_tenant, Course::ComponentHost.components)
  end

  # Checks if the current request is the components page.
  def is_components_page?
    Set['components', 'update_components'].freeze.include?(params[:action])
  end
end
