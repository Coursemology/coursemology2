FactoryGirl.define do
  factory :course_user_invitation, class: Course::UserInvitation do
    transient do
      course nil
      user do
        build(:user)
      end
    end

    course_user do
      options = { workflow_state: :invited }
      options[:user] = user
      options[:course] = course if course
      build(:course_user, options)
    end
    user_email do
      if user.present?
        user.emails.take
      else
        build(:user_email, user: user, primary: false)
      end
    end
    creator
    updater

    after(:create) do |invitation|
      invitation.course_user.save!
      invitation.user_email.save!
    end
  end
end
