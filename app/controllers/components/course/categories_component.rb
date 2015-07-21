class Course::CategoriesComponent < SimpleDelegator
  include Course::ComponentHost::Component

  def sidebar_items
    settings_sidebar_items
  end
  private

  def settings_sidebar_items
    [
      {
        title: t('course.admin.categories.index.header'),
        type: :settings,
        weight: 6,
        path: course_admin_categories_path(current_course)
      }
    ]
  end
end
