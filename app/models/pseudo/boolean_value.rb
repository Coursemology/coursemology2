# frozen_string_literal: true
class Pseudo::BooleanValue
  include ActiveModel::Model
  include ActiveModel::Conversion

  attr_accessor :id, :value
end
