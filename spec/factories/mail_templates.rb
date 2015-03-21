FactoryGirl.define do
  factory :mail_template do
    course
    subject nil
    pre_message nil
    post_message nil
    creator
    updater

    factory :invitation, parent: :mail_template do
      action 'invitation'
      subject 'Please register this course'
    end
  end
end
