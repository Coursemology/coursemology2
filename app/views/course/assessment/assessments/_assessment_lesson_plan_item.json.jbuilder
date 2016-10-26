json.partial! 'course/lesson_plan/items/item.json.jbuilder', item: item

json.lesson_plan_item_type @assessment_tabs_titles_hash[item.tab_id]
