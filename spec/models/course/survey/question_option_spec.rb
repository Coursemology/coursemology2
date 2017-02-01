# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Survey::QuestionOption do
  it { is_expected.to belong_to(:question).inverse_of(:options) }
  it { is_expected.to have_many(:answer_options).inverse_of(:question_option).dependent(:destroy) }
end
