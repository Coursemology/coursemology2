class Course::CoursesComponent < SimpleDelegator
  include Course::ComponentHost::Component

  def sidebar_items
    admin_sidebar_items + settings_sidebar_items
  end

  private

  def admin_sidebar_items
    [
      {
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
      weight: 1,
      path: course_admin_path(current_course)
    }
  end

  def settings_components_item
    {
      title: t('layouts.course_admin.component_settings.title'),
      type: :settings,
      weight: 2,
      path: course_admin_components_path(current_course)
    }
  end

  def settings_sidebar_item
    {
      title: t('layouts.course_admin.sidebar_settings.title'),
      type: :settings,
      weight: 3,
      path: course_admin_sidebar_path(current_course)
    }
  end
end
