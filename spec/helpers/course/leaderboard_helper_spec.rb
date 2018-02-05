# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::ControllerHelper do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:students) { create_list(:course_student, 3, course: course) }
    let(:phantom_student) { create(:course_student, :phantom, course: course) }
    let!(:points_records) do
      [
        create(:course_experience_points_record, course_user: students[1], points_awarded: 10),
        create(:course_experience_points_record, course_user: students[2], points_awarded: 5),
        create(:course_experience_points_record, course_user: phantom_student, points_awarded: 50)
      ]
    end

    describe '#leaderboard_position' do
      subject do
        students.map { |student| helper.leaderboard_position(course, student, display_user_count) }
      end

      context 'when students are on the leaderboard' do
        let(:display_user_count) { 5 }

        it "returns the student's position" do
          expect(subject).to eq([3, 1, 2])
        end
      end

      context 'when students are not the leaderboard' do
        let(:display_user_count) { 1 }

        it "returns the student's position" do
          expect(subject).to eq([nil, 1, nil])
        end
      end
    end
  end
end
