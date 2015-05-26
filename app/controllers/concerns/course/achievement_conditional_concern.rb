module Course::AchievementConditionalConcern
  def return_to_path
    course_achievements_path(@course)
  end

  def set_conditional
    @conditional = Course::Achievement.find(params[:achievement_id])
  end
end
