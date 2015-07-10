module Course::AchievementConditionalConcern
  def return_to_path
    edit_course_achievement_path(current_course, @conditional)
  end

  def set_conditional
    @conditional = Course::Achievement.find(params[:achievement_id])
  end
end
