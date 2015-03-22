FactoryGirl.define do
  factory :course_mail_template, class: Course::MailTemplate.name do
    course
    subject nil
    pre_message nil
    post_message nil
    creator
    updater

    factory :invitation, parent: :course_mail_template do
      action 'invitation'
      subject 'Please register this course'
    end
  end
end
