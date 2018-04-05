# frozen_string_literal: true
ActsAsTenant.with_tenant(Instance.default) do
  # Create the default user account (administrator).
  user = User::Email.find_by_email('test@example.org')
  unless user
    user = User.new(name: 'Administrator', email: 'test@example.org',
                    password: 'Coursemology!', role: :administrator)
    user.skip_confirmation!
    user.save!
  end
end
