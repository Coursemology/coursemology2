module CourseUser::UsersConcern
  def with_approved_state # :nodoc:
    merge(CourseUser.with_approved_state)
  end
end
