# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::ExperiencePointsRecordsHelper do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    describe '#awarder_name' do
      let(:course_user) { create(:course_user) }
      let(:record) { create(:course_experience_points_record, course_user: course_user) }
      let(:user_awarder) { create(:administrator) }
      let(:course_user_awarder) do
        create(:course_teaching_assistant, :approved, course: course_user.course)
      end

      subject { awarder_name(record) }

      context "when the awarder is part of the awardee's course" do
        before { User.stamper = course_user_awarder.user }

        it 'is the name of the points awarder' do
          is_expected.to eq(course_user_awarder.name)
        end
      end

      context "when the awarder is not part of the awardee's course" do
        before { User.stamper = user_awarder }

        it 'is the name of the points awarder' do
          is_expected.to eq(user_awarder.name)
        end
      end
    end
  end
end
