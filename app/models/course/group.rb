# frozen_string_literal: true
class Course::Group < ApplicationRecord
  validates :name, length: { maximum: 255 }, presence: true
  validates :creator, presence: true
  validates :updater, presence: true
  validates :group_category, presence: true
  validates :name, uniqueness: { scope: [:group_category_id], if: -> { group_category_id? && name_changed? } }
  validates :group_category_id, uniqueness: { scope: [:name], if: -> { name? && group_category_id_changed? } }

  belongs_to :group_category, inverse_of: :groups
  has_many :group_users, -> { order_by_course_user_name },
           inverse_of: :group, dependent: :destroy, class_name: 'Course::GroupUser',
           foreign_key: :group_id
  has_many :course_users, through: :group_users

  # This needs to be declared after the association
  validate :validate_new_users_are_unique

  accepts_nested_attributes_for :group_users,
                                allow_destroy: true,
                                reject_if: ->(params) { params[:course_user_id].blank? }

  # @!attribute [r] average_experience_points
  #   Returns the average experience points of group users in this group who are students.
  calculated :average_experience_points, (lambda do
    # Course::GroupUser.where('course_group_users.group_id = course_groups.id').
    #   joining { course_user.experience_points_records.outer }.
    #   where('course_users.role = ?', CourseUser.roles[:student]).
    #   # CAST is used to force a float division (integer division by default).
    #   # greatest(#, 1) is used to avoid division by 0.
    #   selecting do
    #     cast(sql('coalesce(sum(course_experience_points_records.points_awarded), 0.0) as float')) /
    #     greatest(sql('count(distinct(course_group_users.course_user_id)), 1.0'))
    #   end
    Course::GroupUser.where('course_group_users.group_id = course_groups.id').
      left_outer_joins(course_user: :experience_points_records).
      where(CourseUser.arel_table[:role].eq(CourseUser.roles[:student])).
      select(Arel.sql('coalesce(sum(course_experience_points_records.points_awarded), 0.0)::float /'\
                      ' GREATEST(count(distinct(course_group_users.course_user_id)), 1.0)'))
  end)

  # @!attribute [r] average_achievement_count
  #   Returns the average number of achievements obtained by group users in this group who are
  #   students.
  calculated :average_achievement_count, (lambda do
    Course::GroupUser.where('course_group_users.group_id = course_groups.id').
      left_outer_joins(course_user: :course_user_achievements).
      where(CourseUser.arel_table[:role].eq(CourseUser.roles[:student])).
      select(Arel.sql('count(course_user_achievements.id)::float /'\
                      ' GREATEST(count(distinct(course_group_users.course_user_id)), 1.0)'))
  end)

  # @!attribute [r] last_obtained_achievement
  #   Returns the time of the last obtained achievement by group users in this group who are
  #   students.
  calculated :last_obtained_achievement, (lambda do
    Course::GroupUser.where('course_group_users.group_id = course_groups.id').
      joins(course_user: :course_user_achievements).
      where(CourseUser.arel_table[:role].eq(CourseUser.roles[:student])).
      select('course_user_achievements.obtained_at').limit(1).order('obtained_at DESC')
  end)

  scope :ordered_by_experience_points, (lambda do
    all.calculated(:average_experience_points).order('average_experience_points DESC')
  end)

  # Order course_users by achievement count for use in the group leaderboard.
  #   In the event of a tie in count, the scope will then sort by the group which
  #   obtained the current achievement count first.
  scope :ordered_by_average_achievement_count, (lambda do
    all.calculated(:average_achievement_count, :last_obtained_achievement).
      order('average_achievement_count DESC, last_obtained_achievement ASC')
  end)

  scope :ordered_by_name, -> { order(name: :asc) }

  private

  # Validate that the new users are unique.
  #
  # Validating that the users in general are unique is already handled by the uniqueness
  # constraint in the {GroupUser} model. However, the uniqueness constraint does not work with
  # new records and will raise a {RecordNotUnique} error in that circumstance.
  def validate_new_users_are_unique
    new_group_users = group_users.select(&:new_record?)
    return if new_group_users.count == new_group_users.uniq(&:course_user).count

    errors.add(:group_users, :invalid)
    (new_group_users - new_group_users.uniq(&:course_user)).each do |group_user|
      group_user.errors.add(:course_user, :taken)
    end
  end
end
