# frozen_string_literal: true
module UserMasqueradeConcern
  extend ActiveSupport::Concern

  def can_masquerade?
    primary_email_record.confirmed?
  end
end
