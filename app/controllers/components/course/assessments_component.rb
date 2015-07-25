class Course::AssessmentsComponent < SimpleDelegator
  include Course::ComponentHost::Component

  def sidebar_items
    main_sidebar_items + admin_sidebar_items + admin_settings_items
  end

  private

  def main_sidebar_items
    [
      {
        key: :assessments,
        title: I18n.t('course.assessment.assessments.sidebar_title'),
        weight: 3,
        path: course_assessments_path(current_course),
        unread: 0
      }
    ]
  end

  def admin_sidebar_items
    []
  end

  def admin_settings_items
    [
      {
        title: t('course.assessment.assessments.sidebar_title'),
        type: :settings,
        weight: 6,
        path: course_admin_assessments_path(current_course)
      }
    ]
  end
end
