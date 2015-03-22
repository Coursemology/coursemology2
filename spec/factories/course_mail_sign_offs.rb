FactoryGirl.define do
  factory :course_mail_sign_off, class: Course::MailSignOff.name do
    course
    content 'Best Regards, Demo Sign Off'
    creator
    updater
  end

end
