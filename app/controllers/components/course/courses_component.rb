class Course::CoursesComponent < SimpleDelegator
  include Course::ComponentHost::Component

  def sidebar_items
    admin_sidebar_items + settings_sidebar_items
  end

  private

  def admin_sidebar_items
    [
      {
        key: :settings,
        title: t('layouts.course_admin.title'),
        type: :admin,
        weight: 4,
        path: course_admin_path(current_course)
      }
    ]
  end

  def settings_sidebar_items
    [
      settings_index_item,
      settings_components_item,
      settings_sidebar_item
    ]
  end

  def settings_index_item
    {
      title: t('layouts.course_admin.title'),
      type: :settings,
      controller: 'course/admin/admin',
      action: 'index',
      weight: 1
    }
  end

  def settings_components_item
    {
      title: t('layouts.course_admin.component_settings.title'),
      type: :settings,
      controller: 'course/admin/component_settings',
      action: 'edit',
      weight: 2
    }
  end

  def settings_sidebar_item
    {
      title: t('layouts.course_admin.sidebar_settings.title'),
      type: :settings,
      controller: 'course/admin/sidebar_settings',
      action: 'edit',
      weight: 3
    }
  end
end
