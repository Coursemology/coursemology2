# frozen_string_literal: true
FactoryGirl.define do
  sequence :nested_attribute_new_id do |n|
    Time.zone.now.to_i.to_s + n.to_s
  end
end
