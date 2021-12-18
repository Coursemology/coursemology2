# frozen_string_literal: true
class Course::Settings::Email < ApplicationRecord
  self.table_name = 'course_settings_emails'

  Course.after_initialize do
    Course::Settings::Email.send(:after_course_initialize, self)
  end

  Course::Assessment::Category.after_initialize do
    Course::Settings::Email.send(:after_assessment_category_initialize, self)
  end

  enum component: { announcements: 0, assessments: 1, forums: 2, surveys: 3, users: 4, videos: 5 }
  enum setting: { new_announcement: 0,
                  opening_reminder: 1,
                  closing_reminder: 2,
                  closing_reminder_summary: 3,
                  grades_released: 4,
                  new_comment: 5,
                  new_submission: 6,
                  new_topic: 7,
                  post_replied: 8,
                  new_enrol_request: 9 }

  # A set of email settings that students are able to manage.
  STUDENT_SETTING = Set[:opening_reminder, :closing_reminder, :grades_released, :new_comment,
                        :new_topic, :post_replied, ].map { |v| settings[v] }.freeze

  # A set of email settings that managers are able to manage.
  MANAGER_SETTING = Set[:opening_reminder, :closing_reminder_summary, :new_comment, :new_submission, :new_topic,
                        :post_replied, :new_enrol_request ].map { |v| settings[v] }.freeze

  # A set of email settings that managers are able to manage.
  TEACHING_STAFF_SETTING = Set[:opening_reminder, :closing_reminder_summary, :new_comment, :new_submission, :new_topic,
                               :post_replied ].map { |v| settings[v] }.freeze

  validates :course, presence: true
  validates :regular, inclusion: { in: [true, false] }
  validates :phantom, inclusion: { in: [true, false] }

  belongs_to :course, class_name: Course.name, inverse_of: :setting_emails
  belongs_to :assessment_category, class_name: Course::Assessment::Category.name,
                                   foreign_key: :course_assessment_category_id,
                                   inverse_of: :setting_emails, optional: true

  has_many :email_unsubscriptions, class_name: Course::UserEmailUnsubscription.name,
                                   foreign_key: :course_settings_email_id,
                                   dependent: :destroy

  scope :sorted_for_page_setting, (lambda do
    order('component ASC, course_assessment_category_id ASC, setting ASC').left_outer_joins(:assessment_category).
      select('course_settings_emails.*, course_assessment_categories.title')
  end)

  scope :student_setting, -> { where(setting: STUDENT_SETTING) }

  scope :manager_setting, -> { where(setting: MANAGER_SETTING) }

  scope :teaching_staff_setting, -> { where(setting: TEACHING_STAFF_SETTING) }

  # Build default email settings when a new course is initalised.
  def self.after_course_initialize(course)
    return if course.persisted? || !course.setting_emails.empty?

    default_email_settings = [{ announcements: :new_announcement },
                              { forums: :new_topic },
                              { forums: :post_replied },
                              { surveys: :opening_reminder },
                              { surveys: :closing_reminder },
                              { surveys: :closing_reminder_summary },
                              { videos: :opening_reminder },
                              { videos: :closing_reminder },
                              { users: :new_enrol_request }]

    default_email_settings.each do |default_email_setting|
      component = default_email_setting.keys[0]
      setting = default_email_setting[component]
      course.setting_emails.build(component: component, setting: setting)
    end
  end

  # Build default email settings when a new assessment category is initialised.
  def self.after_assessment_category_initialize(category)
    return if (category.persisted? && category.setting_emails.exists?) || !category.course

    default_email_settings = [{ assessments: :opening_reminder },
                              { assessments: :closing_reminder },
                              { assessments: :closing_reminder_summary },
                              { assessments: :grades_released },
                              { assessments: :new_comment },
                              { assessments: :new_submission }]

    default_email_settings.each do |default_email_setting|
      component = default_email_setting.keys[0]
      setting = default_email_setting[component]
      category.setting_emails.build(course: category.course, component: component, setting: setting)
    end
  end

  def initialize_duplicate(duplicator, other)
    self.course = duplicator.options[:destination_course]
    return unless other.course_assessment_category_id

    self.assessment_category = if duplicator.duplicated?(other.assessment_category)
                                 duplicator.duplicate(other.assessment_category)
                               else
                                 duplicator.options[:destination_course].assessment_categories.first
                               end
  end
end
