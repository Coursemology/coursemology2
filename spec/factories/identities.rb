# frozen_string_literal: true
FactoryBot.define do
  sequence :uid do |n|
    Time.zone.now.to_i.to_s + n.to_s
  end

  factory :identity, class: User::Identity.name do
    user
    uid
    provider { 'facebook' }
  end
end
