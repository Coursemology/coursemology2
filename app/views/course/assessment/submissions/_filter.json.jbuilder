# frozen_string_literal: true

json.filter do
  if can_manage
    json.assessments @category.assessments.ordered_by_date_and_title.published do |a|
      json.id a.id
      json.title a.title
    end

    json.groups current_course.groups.ordered_by_name do |g|
      json.id g.id
      json.name g.name
    end

    json.users current_course.course_users.order_alphabetically.student do |u|
      json.id u.user_id
      json.name u.name
    end

  end
end
