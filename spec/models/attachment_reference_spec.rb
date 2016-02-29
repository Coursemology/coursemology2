require 'rails_helper'

RSpec.describe AttachmentReference do
  it { is_expected.to belong_to(:attachable) }
  it { is_expected.to belong_to(:attachment) }
end
