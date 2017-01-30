# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Survey::AnswerOption do
  it { is_expected.to belong_to(:answer).inverse_of(:options) }
  it { is_expected.to belong_to(:question_option).inverse_of(:answer_options) }
end
