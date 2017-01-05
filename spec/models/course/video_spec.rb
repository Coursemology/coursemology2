# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Video, type: :model do
  it { is_expected.to act_as(Course::LessonPlan::Item) }
  it { is_expected.to have_many(:submissions).inverse_of(:video).dependent(:destroy) }

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:video1) { create(:video, course: course) }
    let(:video2) { create(:video, course: course) }

    describe '.ordered_by_date' do
      it 'orders the videos by date' do
        video1
        video2
        consecutive = course.videos.each_cons(2)
        expect(consecutive.to_a).not_to be_empty
        expect(consecutive.all? { |first, second| first.start_at <= second.start_at })
      end
    end
  end
end
