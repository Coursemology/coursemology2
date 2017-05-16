# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Answer::ScribingScribble do
  it 'belongs to scribing answer' do
    is_expected.to belong_to(:answer).
      class_name(Course::Assessment::Answer::Scribing.name)
  end
end
