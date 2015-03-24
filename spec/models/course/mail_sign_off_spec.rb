require 'rails_helper'

RSpec.describe Course::MailSignOff, type: :model do
  it { is_expected.to belong_to(:course) }
end
