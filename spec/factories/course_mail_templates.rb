FactoryGirl.define do
  factory :course_mail_template, class: Course::MailTemplate.name do
    course
    action 'invitation'
    subject nil
    pre_message nil
    post_message nil
    creator
    updater

    factory :invitation, parent: :course_mail_template do
      action 'invitation'
      subject 'Please register this course'
    end

    factory :announcement, parent: :course_mail_template do
      action 'announcement'
      subject 'New announcement'
    end
  end
end
