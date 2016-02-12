module Course::Assessment::AssessmentsHelper
  def display_assessment_tabs
    return nil if @category.tabs.count == 1
    tabs do
      @category.tabs.each do |item|
        concat(nav_to(format_inline_text(item.title),
                      course_assessments_path(current_course, category: @category, tab: item)))
      end
    end
  end
end
