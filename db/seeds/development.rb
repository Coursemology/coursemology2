ActsAsTenant.with_tenant(Instance.default) do
  # Create the default user account (administrator).
  user = User::Email.find_by_email('test@example.org')
  unless user
    user = User.new(name: 'Administrator', email: 'test@example.org',
                    password: 'Coursemology!', role: :administrator)
    user.skip_confirmation!
    user.save!
  end

  # Create a normal user account.
  user = User::Email.find_by_email('user1@example.org')
  unless user
    user = User.new(name: 'user1', email: 'user1@example.org',
                    password: 'Coursemology!', role: :normal)
    user.skip_confirmation!
    user.save!
  end
end
