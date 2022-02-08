# frozen_string_literal: true
module Course::Group::GroupCategoriesHelper
  include Course::Group::GroupManagerConcern

  def display_groups_tabs
    return nil if viewable_group_categories.count <= 1

    active_category = params[:id] || viewable_group_categories.first

    tabs do
      viewable_group_categories.ordered_by_name.each do |item|
        # If this is the category previously set as active because there was no category parameter in the URL,
        # pass a hash to `nav_to` so it will show the category as active.
        # See https://github.com/doabit/bootstrap-sass-extras/blob/6aa549b91a66055a5f5e37400dbe44f4d17f09c3/app/helpers/nav_helper.rb#L32
        html_options = item == active_category ? { active: true } : nil
        concat(nav_to(format_inline_text(item.name),
                      course_group_category_path(current_course, item),
                      html_options))
      end
    end
  end
end
