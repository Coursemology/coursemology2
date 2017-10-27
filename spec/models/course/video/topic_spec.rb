# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Video::Topic do
  it { is_expected.to act_as(Course::Discussion::Topic) }
  it { is_expected.to belong_to(:video).inverse_of(:topics) }

  let!(:instance) { create(:instance, :with_video_component_enabled) }
  with_tenant(:instance) do
    let(:course) { create(:course, :with_video_component_enabled) }
    let(:student1) { create(:course_student, course: course) }
    let(:student2) { create(:course_student, course: course) }
    let(:student3) { create(:course_student, course: course) }
    let(:video) { create(:video, :published, course: course) }
    let(:topic1) do
      create(:video_topic,
             course: course,
             video: video,
             creator: student1.user,
             posts: [build(:course_discussion_post, creator: student1.user)])
    end
    let(:topic2) do
      create(:video_topic,
             course: course,
             video: video,
             creator: student2.user,
             posts: [build(:course_discussion_post, creator: student2.user)])
    end

    describe '.from_user' do
      it 'only returns discussion_topic ids of the given user' do
        topic1_id = topic1.acting_as.id
        expect(video.topics.from_user(student1.user).map(&:id)).to match_array([topic1_id])

        topic2_id = topic2.acting_as.id
        expect(video.topics.from_user(student2.user).map(&:id)).to match_array([topic2_id])

        expect(video.topics.from_user(student3.user).empty?).to be_truthy
      end
    end
  end
end
