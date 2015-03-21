require 'rails_helper'

RSpec.describe MailSignOff, :type => :model do
  it { is_expected.to belong_to(:course) }
end
