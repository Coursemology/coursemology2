class Course::Admin::MaterialSettingsController < Course::Admin::Controller
  add_breadcrumb :edit, :course_admin_materials_path
  before_action :load_settings

  def edit
  end

  def update
    if @settings.update(material_settings_params) && current_course.save
      redirect_to course_admin_materials_path(current_course), success: t('.success')
    else
      render 'edit'
    end
  end

  private

  def material_settings_params #:nodoc:
    params.require(:material_settings).permit(:title)
  end

  # Load our settings adapter to handle material settings
  def load_settings
    @settings ||= Course::MaterialSettings.new(current_course.settings(:material))
  end
end
