module UserOmniauthFacebookConcern
  extend ActiveSupport::Concern

  module ClassMethods
    # A convenience method that receives both parameters and session to initialize a user.
    # This is a override of `Devise::Models::Registerable::ClassMethods#new_with_session`
    def new_with_session(params, session)
      super.tap do |user|
        facebook_data = session['devise.facebook_data']
        if facebook_data && (info = facebook_data['info'])
          user.assign_attributes(name: info['name'], email: info['email'])
          user.identities.build(provider: facebook_data['provider'], uid: facebook_data['uid'])
        end
      end
    end
  end
end
