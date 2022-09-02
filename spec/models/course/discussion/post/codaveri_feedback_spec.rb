# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Discussion::Post::CodaveriFeedback do
  it { is_expected.to belong_to(:post).inverse_of(:codaveri_feedback) }
  it { is_expected.to validate_presence_of(:codaveri_feedback_id) }
  it { is_expected.to validate_presence_of(:original_feedback) }
end
