# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Level, type: :model do
  it { is_expected.to belong_to(:course).inverse_of(:levels) }
  it 'ensures that experience points threshold is greater or equal to 0' do
    expect(subject).
      to validate_numericality_of(:experience_points_threshold).
      is_greater_than_or_equal_to(0)
  end

  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    let!(:course) { build(:course) }

    describe 'validations' do
      describe 'uniqueness of experience points threshold' do
        context 'when level have the same threshold as existing level' do
          before { create(:course_level, course: course, experience_points_threshold: 100) }
          subject { build(:course_level, course: course, experience_points_threshold: 100) }

          it 'is invalid' do
            expect(subject).not_to be_valid
          end
        end
      end
    end

    describe '.after_course_initialize' do
      it 'builds one default level' do
        expect(course.levels.size).to eq(1)
      end

      context 'when course is initialised again' do
        it 'does not build another level' do
          level = course.levels.first

          # Call the callback one more time
          Course::Level.after_course_initialize(course)
          expect(course.levels.size).to eq(1)

          course.save
          expect(level).to be_persisted
        end
      end
    end

    describe '.default_scope' do
      before { course.levels.concat(create_list(:course_level, 5, course: course)) }

      it 'orders by ascending experience_points_threshold' do
        course.levels.each_cons(2) do |current_level, next_level|
          expect(current_level.experience_points_threshold).
            to be < next_level.experience_points_threshold
        end
      end

      it 'adds level_number to each level record' do
        course.levels.each_with_index do |level, index|
          expect(level.level_number).to eq(index)
        end
      end
    end

    describe '.default_level?' do
      context 'when the level is a default level' do
        it 'returns true' do
          level = build(:course_level, experience_points_threshold: 0)
          expect(level).to be_default_level
        end
      end

      context 'when the level is not a default level' do
        it 'returns false' do
          level = build(:course_level, experience_points_threshold: 1)
          expect(level).not_to be_default_level
        end
      end
    end

    describe '.next' do
      before { course.levels.concat(create_list(:course_level, 5, course: course)) }

      context 'when current level is not the highest' do
        it 'returns the next level' do
          course.levels.each_cons(2) do |current_level, next_level|
            expect(current_level.next).to eq(next_level)
          end
        end
      end

      context 'when current level is the highest' do
        it 'returns nil' do
          expect(course.levels.last.next).to be_nil
        end
      end
    end
  end
end
