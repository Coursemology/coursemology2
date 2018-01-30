# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Video::Tab, type: :model do
  it { is_expected.to belong_to(:course).inverse_of(:video_tabs) }

  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    describe '.after_course_initialize' do
      let(:course) { build(:course) }

      it 'builds only one video tab' do
        expect(course.video_tabs.length).to eq(1)

        # Call the callback one more time
        Course::Video::Tab.after_course_initialize(course)
        expect(course.video_tabs.length).to eq(1)
      end
    end

    describe '.default_scope' do
      let!(:tabs) { create_list(:course_video_tab, 2) }
      it 'orders by ascending weight' do
        weights = tabs.map(&:weight)
        expect(weights.length).to be > 1
        expect(weights.each_cons(2).all? { |a, b| a <= b }).to be_truthy
      end
    end
  end
end
