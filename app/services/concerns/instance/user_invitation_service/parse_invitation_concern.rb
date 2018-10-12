# frozen_string_literal: true
# This concern includes methods required to parse the invitations data from a form.
class Instance::UserInvitationService; end
module Instance::UserInvitationService::ParseInvitationConcern
  extend ActiveSupport::Autoload

  private

  def parse_invitations(users)
    result = parse_from_form(users)
    result.each { |user| user[:email] = user[:email].downcase }
  end

  def parse_from_form(users)
    users.map do |(_, value)|
      name = value[:name].presence || value[:email]
      { name: name, email: value[:email], role: value[:role] }
    end
  end
end
