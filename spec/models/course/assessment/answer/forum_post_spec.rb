# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Answer::ForumPost do
  it 'belongs to answer' do
    is_expected.to belong_to(:answer).
      class_name(Course::Assessment::Answer::ForumPostResponse.name)
  end
  it { is_expected.to validate_presence_of(:forum_topic_id) }
  it { is_expected.to validate_presence_of(:post_id) }
  it { is_expected.to validate_presence_of(:post_text) }
  it { is_expected.to validate_presence_of(:post_creator_id) }
  it { is_expected.to validate_presence_of(:post_updated_at) }
end
